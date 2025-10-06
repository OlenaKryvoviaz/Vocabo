// Re-export all query functions and types
export * from "./decks";
export * from "./cards";

// You can also create grouped exports for better organization:
export {
  // Deck queries
  getDecksByUserId,
  getDecksWithCardCounts,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  
  // Deck types
  type Deck,
  type DeckWithCardCount,
  type InsertDeck,
  type UpdateDeck,
} from "./decks";

// Re-export ownership verification utilities from auth-utils
export {
  getDeckIfOwner,
  verifyDeckOwnership,
} from "@/lib/auth-utils";

export {
  // Card queries
  getCardsByDeckId,
  getCardById,
  getCardIfOwner,
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
  deleteCardsFromDeck,
  
  // Card types
  type Card,
  type InsertCard,
  type UpdateCard,
} from "./cards";
