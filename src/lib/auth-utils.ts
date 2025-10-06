// src/lib/auth-utils.ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get authenticated user ID or redirect to homepage
 * Use in server components and pages
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }
  
  return userId;
}

/**
 * Get authenticated user ID and billing info or redirect to homepage
 * Use in server components that need billing information
 */
export async function requireAuthWithBilling() {
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }
  
  return { userId, has };
}

/**
 * Get authenticated user ID or return null
 * Use when auth is optional
 */
export async function getOptionalAuth(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get authenticated user ID for API routes
 * Returns null if not authenticated (for API error handling)
 */
export async function getApiAuth(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Verify that a user owns a specific deck
 */
export async function verifyDeckOwnership(
  deckId: number, 
  userId: string
): Promise<boolean> {
  try {
    const deck = await db.select()
      .from(decksTable)
      .where(and(
        eq(decksTable.id, deckId),
        eq(decksTable.userId, userId)
      ));
      
    return deck.length > 0;
  } catch (error) {
    console.error("Error verifying deck ownership:", error);
    return false;
  }
}

/**
 * Require deck ownership or throw error
 * Use in functions that must have ownership verified
 */
export async function requireDeckOwnership(
  deckId: number, 
  userId: string
): Promise<void> {
  const owns = await verifyDeckOwnership(deckId, userId);
  
  if (!owns) {
    throw new Error("Access denied: Deck not found or not owned by user");
  }
}

/**
 * Get deck if user owns it, otherwise throw error
 */
export async function getDeckIfOwner(deckId: number, userId: string) {
  const decks = await db.select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ));
    
  if (decks.length === 0) {
    throw new Error("Deck not found or access denied");
  }
  
  return decks[0];
}

/**
 * Standard API error responses
 */
export const ApiErrors = {
  unauthorized: () => 
    NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    
  forbidden: () => 
    NextResponse.json({ error: "Access denied" }, { status: 403 }),
    
  notFound: (resource: string = "Resource") => 
    NextResponse.json({ error: `${resource} not found` }, { status: 404 }),
    
  badRequest: (message: string = "Invalid request data") => 
    NextResponse.json({ error: message }, { status: 400 }),
    
  serverError: () => 
    NextResponse.json({ error: "Internal server error" }, { status: 500 }),
};

/**
 * Standard API success responses
 */
export const ApiSuccess = {
  ok: <T>(data: T, message?: string) => 
    NextResponse.json({ data, message }),
    
  created: <T>(data: T, message: string = "Created successfully") => 
    NextResponse.json({ data, message }, { status: 201 }),
    
  deleted: (message: string = "Deleted successfully") => 
    NextResponse.json({ message }),
};

/**
 * Higher-order function for API route authentication
 */
export function withAuth<T extends unknown[]>(
  handler: (userId: string, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const userId = await getApiAuth();
    
    if (!userId) {
      return ApiErrors.unauthorized();
    }
    
    try {
      return await handler(userId, ...args);
    } catch (error) {
      console.error("API handler error:", error);
      return ApiErrors.serverError();
    }
  };
}

/**
 * Higher-order function for API routes that require deck ownership
 */
export function withDeckOwnership<T extends unknown[]>(
  handler: (userId: string, deckId: number, ...args: T) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    { params }: { params: { deckId: string } },
    ...args: T
  ): Promise<NextResponse> => {
    const userId = await getApiAuth();
    
    if (!userId) {
      return ApiErrors.unauthorized();
    }
    
    const deckId = parseInt(params.deckId);
    if (isNaN(deckId)) {
      return ApiErrors.badRequest("Invalid deck ID");
    }
    
    try {
      const owns = await verifyDeckOwnership(deckId, userId);
      if (!owns) {
        return ApiErrors.notFound("Deck");
      }
      
      return await handler(userId, deckId, ...args);
    } catch (error) {
      console.error("API handler error:", error);
      return ApiErrors.serverError();
    }
  };
}

/**
 * Common validation functions
 */
export const Validators = {
  deckId: (id: string): number => {
    const deckId = parseInt(id);
    if (isNaN(deckId) || deckId <= 0) {
      throw new Error("Invalid deck ID");
    }
    return deckId;
  },
  
  cardId: (id: string): number => {
    const cardId = parseInt(id);
    if (isNaN(cardId) || cardId <= 0) {
      throw new Error("Invalid card ID");
    }
    return cardId;
  },
  
  deckTitle: (title: unknown): string => {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new Error("Title is required and must be a non-empty string");
    }
    if (title.length > 255) {
      throw new Error("Title must be 255 characters or less");
    }
    return title.trim();
  },
  
  cardContent: (content: unknown): string => {
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error("Card content must be a non-empty string");
    }
    return content.trim();
  },
};

/**
 * Test helpers for security testing
 */
export const TestHelpers = {
  async createTestUser(): Promise<string> {
    // Mock user ID for testing
    return "test_user_" + Math.random().toString(36).substr(2, 9);
  },
  
  async createTestDeck(userId: string, title: string = "Test Deck") {
    return await db.insert(decksTable).values({
      title,
      description: "Test deck description",
      userId,
    }).returning();
  },
};
