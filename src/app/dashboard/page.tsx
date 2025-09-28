import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { decksTable, cardsTable } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Clock, Users } from "lucide-react";

export default async function DashboardPage() {
  // Verify authentication and get user ID
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user's decks with card counts
  const userDecks = await db.select({
    id: decksTable.id,
    title: decksTable.title,
    description: decksTable.description,
    createdAt: decksTable.createdAt,
    updatedAt: decksTable.updatedAt,
    cardCount: count(cardsTable.id),
  })
  .from(decksTable)
  .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
  .where(eq(decksTable.userId, userId))
  .groupBy(decksTable.id)
  .orderBy(desc(decksTable.createdAt));

  // Calculate statistics
  const totalDecks = userDecks.length;
  const totalCards = userDecks.reduce((sum, deck) => sum + deck.cardCount, 0);
  const recentDecks = userDecks.filter(deck => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(deck.createdAt) > oneWeekAgo;
  }).length;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your vocabulary decks and track your learning progress
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Deck
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDecks}</div>
            <p className="text-xs text-muted-foreground">
              {recentDecks} created this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards}</div>
            <p className="text-xs text-muted-foreground">
              Across all your decks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No sessions yet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Decks Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Your Decks</h2>
          {userDecks.length > 0 && (
            <Button variant="outline" size="sm">
              View All
            </Button>
          )}
        </div>

        {userDecks.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No decks yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Create your first vocabulary deck to start learning!
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Deck
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDecks.map((deck) => (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{deck.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {deck.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{deck.cardCount} cards</span>
                    <span>
                      {deck.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1">
                      Study
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
