// Re-export all query functions and types
export * from "./decks";
export * from "./cards";

// You can also create grouped exports for better organization:
export {
  // Deck queries
  getDecksByUserId,
  getDecksWithCardCounts,
  getDeckById,
  getDeckIfOwner,
  createDeck,
  updateDeck,
  deleteDeck,
  verifyDeckOwnership,
  
  // Deck types
  type Deck,
  type DeckWithCardCount,
  type InsertDeck,
  type UpdateDeck,
} from "./decks";

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
