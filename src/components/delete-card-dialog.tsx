"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { deleteCardAction, type DeleteCardFormState } from "@/actions/cards";
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

interface DeleteCardDialogProps {
  cardId: number;
  deckId: number;
  cardFront: string;
  children?: React.ReactNode;
  className?: string;
}

export function DeleteCardDialog({ 
  cardId,
  deckId,
  cardFront,
  children, 
  className 
}: DeleteCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialState: DeleteCardFormState = {};
  const [state, formAction] = useActionState(deleteCardAction, initialState);

  // Close dialog and reset form when card is successfully deleted
  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setIsSubmitting(false);
    }
  }, [state.success]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formAction(formData);
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
          <DialogTitle>Delete Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this card? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {/* Show preview of card being deleted */}
        <div className="bg-muted/50 rounded-md p-3 my-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Card:</p>
          <p className="text-base font-medium truncate">{cardFront}</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {/* Hidden fields for IDs */}
          <input type="hidden" name="cardId" value={cardId} />
          <input type="hidden" name="deckId" value={deckId} />
          
          {/* General form errors */}
          {state.errors?._form && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{state.errors._form[0]}</p>
            </div>
          )}

          {/* Success message */}
          {state.success && (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-700">Card deleted successfully!</p>
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
                  Delete Card
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
