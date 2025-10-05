'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Sparkles } from 'lucide-react';
import { generateAIFlashcards } from '@/actions/cards';
import { toast } from 'sonner';

interface AIGenerateDialogProps {
  deckId: number;
  deckTitle: string;
  deckDescription: string | null;
  children?: React.ReactNode;
}

export function AIGenerateDialog({ 
  deckId, 
  deckTitle, 
  deckDescription, 
  children 
}: AIGenerateDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateAIFlashcards(
        deckId,
        deckTitle,
        deckDescription,
        20 // Generate 20 cards as requested
      );

      if (result.success) {
        toast.success(`Generated ${result.totalGenerated} flashcards successfully!`);
        setIsOpen(false); // Close dialog on success
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate AI Flashcards
          </DialogTitle>
          <DialogDescription>
            Generate 20 flashcards using AI based on your deck&apos;s title and description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-sm font-medium">Deck Title:</span>
              <p className="text-sm text-muted-foreground">{deckTitle}</p>
            </div>
            {deckDescription && (
              <div>
                <span className="text-sm font-medium">Description:</span>
                <p className="text-sm text-muted-foreground">{deckDescription}</p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            AI will generate 20 unique flashcards based on your deck&apos;s topic. This will add to your existing cards.
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate 20 Cards
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
