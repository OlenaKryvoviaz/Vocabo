"use server";

import { revalidatePath } from "next/cache";
import { requireAuthWithBilling, Validators } from "@/lib/auth-utils";
import { createCard, updateCard, deleteCard } from "@/db/queries/cards";
import { z } from "zod";
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from "@/lib/db";
import { cardsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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
  const { userId } = await requireAuthWithBilling();

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
    // Validate card content using utilities
    const validatedFront = Validators.cardContent(front);
    const validatedBack = Validators.cardContent(back);
    
    // Create the new card
    await createCard(deckId, userId, {
      front: validatedFront,
      back: validatedBack,
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
  const { userId } = await requireAuthWithBilling();

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
    // Validate card content using utilities
    const validatedFront = Validators.cardContent(front);
    const validatedBack = Validators.cardContent(back);
    
    // Update the card with ownership verification
    await updateCard(cardId, userId, {
      front: validatedFront,
      back: validatedBack,
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
  const { userId } = await requireAuthWithBilling();

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

// Schema for AI flashcard generation
const flashcardSchema = z.object({
  front: z.string().min(1, "Front of card cannot be empty"),
  back: z.string().min(1, "Back of card cannot be empty"),
});

const flashcardsResponseSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1).max(25), // Allow a bit more flexibility
  topic: z.string(),
  totalCount: z.number(),
});

export async function generateAIFlashcards(
  deckId: number,
  deckTitle: string,
  deckDescription: string | null,
  count: number = 20
) {
  // 🔐 CRITICAL: Always verify authentication and Pro subscription
  const { has } = await requireAuthWithBilling();

  // 🔐 CRITICAL: Check for AI feature access (Pro plan required)
  const hasAIFeature = has({ feature: 'ai_flashcard_generation' });
  if (!hasAIFeature) {
    throw new Error('AI flashcard generation is only available for Pro users. Please upgrade your plan.');
  }

  try {
    // Create a comprehensive topic from deck title and description
    const topic = deckDescription 
      ? `${deckTitle} - ${deckDescription}`
      : deckTitle;

    // Detect if this is a language learning deck
    const isLanguageLearning = /\b(to\s+\w+|vocabulary|translation|language|learn\s+\w+|spanish|french|german|italian|portuguese|chinese|japanese|korean|arabic|russian|indonesian|dutch|swedish|norwegian|finnish)\b/i.test(topic);

    // Generate structured flashcards using Vercel AI
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'), // Use gpt-4o-mini which supports structured output
      schema: flashcardsResponseSchema,
      prompt: isLanguageLearning 
        ? `Generate exactly ${count} language learning flashcards for: "${topic}".
      
      LANGUAGE LEARNING FORMAT:
      - Front: Simple word, phrase, or sentence in the source language
      - Back: Direct translation only (no explanations or descriptions)
      - Focus on practical, commonly used words and phrases
      - Vary between single words, common phrases, and useful sentences
      - Make translations accurate and concise
      
      Example for English to Spanish:
      Front: "Hello"
      Back: "Hola"
      
      Front: "How are you?"
      Back: "¿Cómo estás?"
      
      IMPORTANT: Generate exactly ${count} flashcards with simple, direct translations.`
        
        : `Generate exactly ${count} flashcards for the topic: "${topic}".
      
      Requirements:
      - Generate EXACTLY ${count} flashcards, no more, no less
      - Focus on educational content relevant to the topic
      - Each flashcard should have a clear question/term/concept on the front
      - Each flashcard should have a comprehensive answer/definition/explanation on the back
      - Make flashcards educational and practical for learning
      - Vary the types of content (definitions, examples, explanations, facts, etc.)
      - Ensure each card is unique and builds upon the topic theme
      - Keep content appropriate for learners
      - Make sure the front and back are clearly different (front = question/term, back = answer/explanation)
      
      IMPORTANT: Return exactly ${count} flashcards in the flashcards array.`,
    });

    // 🔍 Validate the generated content
    if (!object.flashcards || object.flashcards.length === 0) {
      throw new Error('Failed to generate flashcards');
    }

    // 📝 Get the current highest order for proper card ordering
    const existingCards = await db
      .select({ order: cardsTable.order })
      .from(cardsTable)
      .where(eq(cardsTable.deckId, deckId))
      .orderBy(desc(cardsTable.order))
      .limit(1);

    const startingOrder = existingCards.length > 0 ? (existingCards[0].order ?? 0) + 1 : 0;

    // 💾 Insert generated flashcards into database
    const cardsToInsert = object.flashcards.map((card, index) => ({
      deckId,
      front: card.front,
      back: card.back,
      order: startingOrder + index,
    }));

    const insertedCards = await db
      .insert(cardsTable)
      .values(cardsToInsert)
      .returning();

    // Revalidate the deck page to show new cards
    revalidatePath(`/decks/${deckId}`);

    return {
      success: true,
      cards: insertedCards,
      generatedTopic: object.topic,
      totalGenerated: object.totalCount,
    };

  } catch (error) {
    console.error('AI flashcard generation error:', error);
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      throw new Error(`Failed to generate flashcards: ${error.message}`);
    }
    
    throw new Error('An unexpected error occurred while generating flashcards');
  }
}
