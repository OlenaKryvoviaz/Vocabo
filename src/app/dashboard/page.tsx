import { auth } from "@clerk/nextjs/server";
import { Protect } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDecksWithCardCounts } from "@/db/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { Plus, BookOpen, Clock, Calendar, Crown } from "lucide-react";

export default async function DashboardPage() {
  // Verify authentication and get user ID with billing info
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Check user's plan and features
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const hasThreeDeckLimit = has({ feature: '3_deck_limit' });

  // Fetch user's decks with card counts
  const userDecks = await getDecksWithCardCounts(userId);

  // Calculate if user is at deck limit
  const isAtDeckLimit = hasThreeDeckLimit && userDecks.length >= 3;


  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Dashboard Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage your vocabulary decks and track your learning progress
          </p>
        </div>
        
        {/* Deck Limit Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Protect
              feature="3_deck_limit"
              fallback={
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Pro - Unlimited decks
                  </Badge>
                </div>
              }
            >
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={userDecks.length >= 3 ? "outline" : "secondary"}>
                  {userDecks.length}/3 decks
                </Badge>
                {userDecks.length >= 3 && (
                  <span className="text-muted-foreground font-medium">Limit reached</span>
                )}
              </div>
            </Protect>
          </div>

          {/* Create Deck Button */}
          {isAtDeckLimit ? (
            <Button size="sm" variant="outline" asChild>
              <Link href="/pricing" className="flex items-center gap-2 text-xs h-8 px-3">
                <Crown className="h-3 w-3" />
                Upgrade for Unlimited Decks
              </Link>
            </Button>
          ) : (
            <CreateDeckDialog>
              <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs h-8 px-3">
                <Plus className="h-3 w-3" />
                Create New Deck
              </Button>
            </CreateDeckDialog>
          )}
        </div>
      </div>
      
      <Separator />


      {/* Decks Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Your Decks</h2>
            {userDecks.length > 0 && (
              <Badge variant="secondary" className="text-xs font-medium">
                {userDecks.length} {userDecks.length === 1 ? 'deck' : 'decks'}
              </Badge>
            )}
          </div>
          {userDecks.length > 0 && (
            <Button variant="outline" size="sm">
              View All
            </Button>
          )}
        </div>

        {userDecks.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="flex flex-col items-center space-y-6">
              <div className="rounded-full bg-muted p-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight">No decks yet</h3>
                <p className="text-muted-foreground max-w-sm text-sm">
                  Create your first vocabulary deck to start learning and practicing new words!
                </p>
              </div>
              <CreateDeckDialog>
                <Button size="lg" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Deck
                </Button>
              </CreateDeckDialog>
            </div>
          </Card>
        ) : (
          <>
            {/* Upgrade Prompt for Free Users Near Limit */}
            <Protect
              feature="3_deck_limit"
              fallback={null}
            >
              {userDecks.length >= 2 && (
                <Alert>
                  <Crown className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {userDecks.length === 2 ? "Almost at your limit!" : "Deck limit reached"}
                      </div>
                      <div className="text-sm">
                        {userDecks.length === 2 
                          ? "You can create 1 more deck. Upgrade to Pro for unlimited decks."
                          : "You've reached your 3-deck limit. Upgrade to Pro for unlimited decks."
                        }
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="ml-4">
                      <Link href="/pricing" className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Upgrade to Pro
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </Protect>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDecks.map((deck) => (
                <Link key={deck.id} href={`/decks/${deck.id}`} className="block group">
                  <Card className="h-full transition-all duration-200 group-hover:shadow-lg group-hover:border-primary/20 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                          {deck.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {deck.cardCount} cards
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {deck.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Separator className="mb-3" />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Updated {deck.updatedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
