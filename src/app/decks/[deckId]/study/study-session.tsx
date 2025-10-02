"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff, Check, X, Keyboard } from "lucide-react";
import type { Card as CardType } from "@/db/queries/cards";
import type { Deck } from "@/db/queries/decks";

interface StudySessionProps {
  deck: Deck;
  cards: CardType[];
}

export function StudySession({ deck, cards }: StudySessionProps) {
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState(new Set<number>());
  const [incorrectCards, setIncorrectCards] = useState<CardType[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Create the full deck including retry cards
  const fullCardsDeck = useMemo(() => {
    return [...cards, ...incorrectCards];
  }, [cards, incorrectCards]);

  const currentCard = fullCardsDeck[currentCardIndex];
  const originalCardsCount = cards.length;
  const totalCardsToStudy = fullCardsDeck.length;
  const progress = totalCardsToStudy > 0 ? Math.round(((currentCardIndex + 1) / totalCardsToStudy) * 100) : 0;

  const handleCorrect = () => {
    // Mark card as studied
    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    setHasAnswered(true);
    
    // Move to next card after a short delay
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleIncorrect = () => {
    // Add card to retry queue if it's not already there and it's from the original deck
    const isOriginalCard = cards.some(card => card.id === currentCard.id);
    const isAlreadyInRetry = incorrectCards.some(card => card.id === currentCard.id);
    
    if (isOriginalCard && !isAlreadyInRetry) {
      setIncorrectCards(prev => [...prev, currentCard]);
    }
    
    setHasAnswered(true);
    
    // Move to next card after a short delay
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleNext = () => {
    if (currentCardIndex < totalCardsToStudy - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
      setHasAnswered(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
      setHasAnswered(false);
    }
  };

  const handleFlipCard = () => {
    setShowAnswer(prev => !prev);
  };

  const handleResetSession = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudiedCards(new Set());
    setIncorrectCards([]);
    setHasAnswered(false);
  };

  const handleFinishSession = () => {
    router.push(`/decks/${deck.id}`);
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for the keys we're handling
      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight' || event.code === 'Space') {
        event.preventDefault();
      }

      switch (event.code) {
        case 'ArrowLeft':
          if (currentCardIndex > 0) {
            handlePrevious();
          }
          break;
        case 'ArrowRight':
          if (currentCardIndex < totalCardsToStudy - 1 && (!showAnswer || hasAnswered)) {
            handleNext();
          }
          break;
        case 'Space':
          if (!showAnswer || hasAnswered) {
            handleFlipCard();
          }
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCardIndex, totalCardsToStudy, showAnswer, hasAnswered]);

  const isLastCard = currentCardIndex === totalCardsToStudy - 1;
  const hasStudiedCurrentCard = studiedCards.has(currentCard.id);
  const remainingCards = originalCardsCount - studiedCards.size;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/decks/${deck.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{deck.title}</h1>
            <p className="text-sm text-muted-foreground">Study Session</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetSession}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Card {currentCardIndex + 1} of {totalCardsToStudy}
          </span>
          <Badge variant="secondary">
            {progress}% Complete
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {incorrectCards.length > 0 && currentCardIndex >= originalCardsCount && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Reviewing incorrect cards
            </Badge>
          </div>
        )}
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <Card className="min-h-[400px] hover:shadow-lg transition-shadow cursor-pointer" onClick={!showAnswer || hasAnswered ? handleFlipCard : undefined}>
          <CardContent className="p-8 h-full flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              {!showAnswer ? (
                <>
                  <div className="mb-4">
                    <Badge variant="outline" className="mb-4">
                      Question
                    </Badge>
                  </div>
                  <div className="text-xl font-medium leading-relaxed max-w-2xl">
                    {currentCard.front}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-8">
                    <Eye className="h-4 w-4" />
                    Click to reveal answer
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <Badge variant="default" className="mb-4">
                      Answer
                    </Badge>
                  </div>
                  <div className="text-xl font-medium leading-relaxed max-w-2xl text-primary">
                    {currentCard.back}
                  </div>
                  <Separator className="w-full max-w-md" />
                  <div className="text-lg text-muted-foreground">
                    {currentCard.front}
                  </div>
                  
                  {!hasAnswered ? (
                    <div className="mt-6 space-y-4">
                      <div className="text-sm text-muted-foreground mb-3">
                        Did you get it right?
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCorrect();
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Correct
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncorrect();
                          }}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Incorrect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                      <EyeOff className="h-4 w-4" />
                      {hasStudiedCurrentCard ? (
                        <span className="text-green-600 font-medium">Marked as correct!</span>
                      ) : (
                        <span className="text-red-600 font-medium">Will review again later</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center space-x-4">
          <Button
            variant={showAnswer ? "default" : "outline"}
            onClick={handleFlipCard}
            disabled={showAnswer && !hasAnswered}
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
          
          {isLastCard && hasAnswered ? (
            <Button 
              onClick={handleFinishSession}
              className="bg-green-600 hover:bg-green-700"
            >
              Finish Session
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={currentCardIndex === totalCardsToStudy - 1 || (showAnswer && !hasAnswered)}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-6 mb-4">
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Keyboard Shortcuts</span>
            </div>
            <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-0.5">←</Badge>
                <span>Previous</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-0.5">→</Badge>
                <span>Next</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-0.5">Space</Badge>
                <span>Flip Card</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Statistics */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            Studied: {studiedCards.size}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted rounded-full" />
            Remaining: {remainingCards}
          </div>
          {incorrectCards.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              To Review: {incorrectCards.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
