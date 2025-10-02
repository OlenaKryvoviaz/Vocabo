import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getDeckIfOwner } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { StudySession } from "./study-session";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  // Verify authentication and get user ID
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Parse deck ID
  const resolvedParams = await params;
  const deckId = parseInt(resolvedParams.deckId);
  if (isNaN(deckId)) {
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
