"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateDeck } from "@/db/queries/decks";
import { z } from "zod";

// Schema for validating deck update input
const updateDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional(),
  deckId: z.coerce.number().int().positive("Invalid deck ID"),
});

export type UpdateDeckFormState = {
  errors?: {
    title?: string[];
    description?: string[];
    deckId?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function updateDeckAction(
  prevState: UpdateDeckFormState,
  formData: FormData
): Promise<UpdateDeckFormState> {
  // Verify authentication
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Validate form data
  const validatedFields = updateDeckSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    deckId: formData.get("deckId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description, deckId } = validatedFields.data;

  try {
    // Update the deck with ownership verification
    await updateDeck(deckId, userId, {
      title: title.trim(),
      description: description?.trim() || null,
    });

    // Revalidate the deck page to show the updated information
    revalidatePath(`/decks/${deckId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating deck:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return {
          errors: {
            _form: ["Deck not found or you don't have permission to edit this deck."],
          },
        };
      }
    }

    return {
      errors: {
        _form: ["Failed to update deck. Please try again."],
      },
    };
  }
}
