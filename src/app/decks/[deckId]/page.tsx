import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeckIfOwner } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Plus, Edit, Trash2 } from "lucide-react";
import { AddCardDialog } from "@/components/add-card-dialog";
import { EditDeckDialog } from "@/components/edit-deck-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { DeleteCardDialog } from "@/components/delete-card-dialog";

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
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

    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{deck.title}</h1>
              {deck.description && (
                <p className="text-muted-foreground mt-1">{deck.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <EditDeckDialog 
              deckId={deckId}
              currentTitle={deck.title}
              currentDescription={deck.description}
            />
            <AddCardDialog deckId={deckId} />
          </div>
        </div>

        {/* Deck Info */}
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <span>{cards.length} {cards.length === 1 ? 'card' : 'cards'}</span>
          <span>Created: {deck.createdAt.toLocaleDateString()}</span>
          <span>Updated: {deck.updatedAt.toLocaleDateString()}</span>
        </div>

        {/* Cards Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Cards</h2>
            {cards.length > 0 && (
              <Button variant="outline" size="sm">
                Study Deck
              </Button>
            )}
          </div>

          {cards.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No cards yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Add your first card to start building this vocabulary deck!
                  </p>
                </div>
                <AddCardDialog deckId={deckId}>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Card
                  </Button>
                </AddCardDialog>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <Card key={card.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Front</p>
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-base font-medium">{card.front}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Back</p>
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-base font-medium">{card.back}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <EditCardDialog
                        cardId={card.id}
                        deckId={deckId}
                        currentFront={card.front}
                        currentBack={card.back}
                      >
                        <Button variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </EditCardDialog>
                      <DeleteCardDialog
                        cardId={card.id}
                        deckId={deckId}
                        cardFront={card.front}
                      >
                        <Button variant="outline" className="flex-1">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </DeleteCardDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Study Actions */}
        {cards.length > 0 && (
          <div className="flex justify-center">
            <div className="flex space-x-4">
              <Button size="lg" className="px-8">
                Start Studying
              </Button>
              <Button variant="outline" size="lg">
                Practice Mode
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading deck:", error);
    // If deck not found or access denied, show 404
    notFound();
  }
}
