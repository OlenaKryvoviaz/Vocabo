"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCard, updateCard, deleteCard } from "@/db/queries/cards";
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
    // Create the new card
    await createCard(deckId, userId, {
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

// Schema for validating card update input
const updateCardSchema = z.object({
  front: z.string().min(1, "Front text is required").max(1000, "Front text must be 1000 characters or less"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text must be 1000 characters or less"),
  cardId: z.coerce.number().int().positive("Invalid card ID"),
  deckId: z.coerce.number().int().positive("Invalid deck ID"),
});

export type UpdateCardFormState = {
  errors?: {
    front?: string[];
    back?: string[];
    cardId?: string[];
    deckId?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function updateCardAction(
  prevState: UpdateCardFormState,
  formData: FormData
): Promise<UpdateCardFormState> {
  // Verify authentication
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Validate form data
  const validatedFields = updateCardSchema.safeParse({
    front: formData.get("front"),
    back: formData.get("back"),
    cardId: formData.get("cardId"),
    deckId: formData.get("deckId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { front, back, cardId, deckId } = validatedFields.data;

  try {
    // Update the card with ownership verification
    await updateCard(cardId, userId, {
      front: front.trim(),
      back: back.trim(),
    });

    // Revalidate the deck page to show the updated card
    revalidatePath(`/decks/${deckId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating card:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return {
          errors: {
            _form: ["Card not found or you don't have permission to edit this card."],
          },
        };
      }
    }

    return {
      errors: {
        _form: ["Failed to update card. Please try again."],
      },
    };
  }
}

// Schema for validating card delete input
const deleteCardSchema = z.object({
  cardId: z.coerce.number().int().positive("Invalid card ID"),
  deckId: z.coerce.number().int().positive("Invalid deck ID"),
});

export type DeleteCardFormState = {
  errors?: {
    cardId?: string[];
    deckId?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function deleteCardAction(
  prevState: DeleteCardFormState,
  formData: FormData
): Promise<DeleteCardFormState> {
  // Verify authentication
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Validate form data
  const validatedFields = deleteCardSchema.safeParse({
    cardId: formData.get("cardId"),
    deckId: formData.get("deckId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { cardId, deckId } = validatedFields.data;

  try {
    // Delete the card with ownership verification
    await deleteCard(cardId, userId);

    // Revalidate the deck page to remove the deleted card
    revalidatePath(`/decks/${deckId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting card:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return {
          errors: {
            _form: ["Card not found or you don't have permission to delete this card."],
          },
        };
      }
    }

    return {
      errors: {
        _form: ["Failed to delete card. Please try again."],
      },
    };
  }
}
