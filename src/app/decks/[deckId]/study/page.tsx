import { notFound, redirect } from "next/navigation";
import { requireAuth, getDeckIfOwner, Validators } from "@/lib/auth-utils";
import { getCardsByDeckId } from "@/db/queries/cards";
import { StudySession } from "./study-session";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  // Verify authentication and get user ID
  const userId = await requireAuth();

  // Parse and validate deck ID
  const resolvedParams = await params;
  let deckId: number;
  try {
    deckId = Validators.deckId(resolvedParams.deckId);
  } catch {
    notFound();
  }

  try {
    // Fetch deck and cards with ownership verification
    const [deck, cards] = await Promise.all([
      getDeckIfOwner(deckId, userId),
      getCardsByDeckId(deckId, userId)
    ]);

    // Check if deck has cards
    if (cards.length === 0) {
      redirect(`/decks/${deckId}`);
    }

    return (
      <StudySession 
        deck={deck}
        cards={cards}
      />
    );
  } catch (error) {
    console.error("Error loading study session:", error);
    notFound();
  }
}
