"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { deleteDeckAction, type DeleteDeckFormState } from "@/actions/decks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteDeckDialogProps {
  deckId: number;
  deckTitle: string;
  cardCount: number;
  children?: React.ReactNode;
  className?: string;
}

export function DeleteDeckDialog({ 
  deckId,
  deckTitle,
  cardCount,
  children, 
  className 
}: DeleteDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialState: DeleteDeckFormState = {};
  const [state, formAction] = useActionState(deleteDeckAction, initialState);


  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    console.log("Starting delete process...");
    
    // Call the server action
    formAction(formData);
    
    // Force redirect after 300ms to ensure deletion completes
    setTimeout(() => {
      console.log("Forcing redirect to dashboard after 300ms...");
      window.location.href = "/dashboard";
    }, 300);
  };

  // Reset submitting state if there are errors
  useEffect(() => {
    if (state.errors && !state.success) {
      setIsSubmitting(false);
    }
  }, [state.errors, state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className={className}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Deck</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this deck? This action cannot be undone and will also delete all {cardCount} {cardCount === 1 ? 'card' : 'cards'} in this deck.
          </DialogDescription>
        </DialogHeader>
        
        {/* Show preview of deck being deleted */}
        <div className="bg-muted/50 rounded-md p-3 my-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Deck:</p>
          <p className="text-base font-medium truncate">{deckTitle}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'} will also be deleted
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {/* Hidden field for deck ID */}
          <input type="hidden" name="deckId" value={deckId} />
          
          {/* General form errors */}
          {state.errors?._form && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{state.errors._form[0]}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Deck
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
