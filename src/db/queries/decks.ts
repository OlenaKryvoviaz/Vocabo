import { db } from "@/lib/db";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Type definitions
export type Deck = InferSelectModel<typeof decksTable>;
export type DeckWithCardCount = Deck & { cardCount: number };
export type InsertDeck = InferInsertModel<typeof decksTable>;
export type UpdateDeck = Partial<Omit<InsertDeck, 'id' | 'userId' | 'createdAt'>>;

/**
 * Get all decks for a user ordered by creation date (newest first)
 */
export async function getDecksByUserId(userId: string): Promise<Deck[]> {
  try {
    return await db.select()
      .from(decksTable)
      .where(eq(decksTable.userId, userId))
      .orderBy(desc(decksTable.createdAt));
  } catch (error) {
    console.error("Error fetching user decks:", error);
    throw new Error("Failed to fetch decks");
  }
}

/**
 * Get user's decks with card counts - used for dashboard display
 */
export async function getDecksWithCardCounts(userId: string): Promise<DeckWithCardCount[]> {
  try {
    return await db.select({
      id: decksTable.id,
      title: decksTable.title,
      description: decksTable.description,
      userId: decksTable.userId,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: count(cardsTable.id),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, userId))
    .groupBy(decksTable.id)
    .orderBy(desc(decksTable.createdAt));
  } catch (error) {
    console.error("Error fetching decks with card counts:", error);
    throw new Error("Failed to fetch decks with card counts");
  }
}

/**
 * Get a specific deck by ID with ownership verification
 */
export async function getDeckById(deckId: number, userId: string): Promise<Deck | null> {
  try {
    const result = await db.select()
      .from(decksTable)
      .where(and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      ))
      .limit(1);
      
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching deck by ID:", error);
    throw new Error("Failed to fetch deck");
  }
}

/**
 * Get deck if user owns it, otherwise throw error
 */
export async function getDeckIfOwner(deckId: number, userId: string): Promise<Deck> {
  try {
    const deck = await getDeckById(deckId, userId);
    
    if (!deck) {
      throw new Error("Deck not found or access denied");
    }
    
    return deck;
  } catch (error) {
    console.error("Error verifying deck ownership:", error);
    throw error;
  }
}

/**
 * Create a new deck for a user
 */
export async function createDeck(data: Omit<InsertDeck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
  try {
    const [newDeck] = await db.insert(decksTable).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return newDeck;
  } catch (error) {
    console.error("Error creating deck:", error);
    throw new Error("Failed to create deck");
  }
}

/**
 * Update an existing deck with ownership verification
 */
export async function updateDeck(deckId: number, userId: string, data: UpdateDeck): Promise<Deck> {
  try {
    // First verify ownership
    await getDeckIfOwner(deckId, userId);
    
    const [updatedDeck] = await db.update(decksTable)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      ))
      .returning();
      
    if (!updatedDeck) {
      throw new Error("Failed to update deck");
    }
    
    return updatedDeck;
  } catch (error) {
    console.error("Error updating deck:", error);
    throw error;
  }
}

/**
 * Delete a deck with ownership verification
 */
export async function deleteDeck(deckId: number, userId: string): Promise<Deck> {
  try {
    // First verify ownership
    await getDeckIfOwner(deckId, userId);
    
    const [deletedDeck] = await db.delete(decksTable)
      .where(and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      ))
      .returning();
      
    if (!deletedDeck) {
      throw new Error("Failed to delete deck");
    }
    
    return deletedDeck;
  } catch (error) {
    console.error("Error deleting deck:", error);
    throw error;
  }
}

/**
 * Verify that a user owns a specific deck
 */
export async function verifyDeckOwnership(deckId: number, userId: string): Promise<boolean> {
  try {
    const deck = await getDeckById(deckId, userId);
    return deck !== null;
  } catch (error) {
    console.error("Error verifying deck ownership:", error);
    return false;
  }
}
