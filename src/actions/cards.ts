"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCard } from "@/db/queries/cards";
import { z } from "zod";

// Schema for validating card input
const createCardSchema = z.object({
  front: z.string().min(1, "Front text is required").max(1000, "Front text must be 1000 characters or less"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text must be 1000 characters or less"),
  deckId: z.coerce.number().int().positive("Invalid deck ID"),
});

export type CreateCardFormState = {
  errors?: {
    front?: string[];
    back?: string[];
    deckId?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function createCardAction(
  prevState: CreateCardFormState,
  formData: FormData
): Promise<CreateCardFormState> {
  // Verify authentication
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Validate form data
  const validatedFields = createCardSchema.safeParse({
    front: formData.get("front"),
    back: formData.get("back"),
    deckId: formData.get("deckId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { front, back, deckId } = validatedFields.data;

  try {
    // Get the current highest order for this deck to append the new card
    const newCard = await createCard(deckId, userId, {
      front: front.trim(),
      back: back.trim(),
      order: 0, // The database function will handle proper ordering
    });

    // Revalidate the deck page to show the new card
    revalidatePath(`/decks/${deckId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error creating card:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return {
          errors: {
            _form: ["Deck not found or you don't have permission to add cards to this deck."],
          },
        };
      }
    }

    return {
      errors: {
        _form: ["Failed to create card. Please try again."],
      },
    };
  }
}
