"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { updateCardAction, type UpdateCardFormState } from "@/actions/cards";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2 } from "lucide-react";

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  currentFront: string;
  currentBack: string;
  children?: React.ReactNode;
  className?: string;
}

export function EditCardDialog({ 
  cardId,
  deckId,
  currentFront,
  currentBack,
  children, 
  className 
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialState: UpdateCardFormState = {};
  const [state, formAction] = useActionState(updateCardAction, initialState);

  // Close dialog and reset form when card is successfully updated
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
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the front and back content of this flashcard.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          {/* Hidden fields for IDs */}
          <input type="hidden" name="cardId" value={cardId} />
          <input type="hidden" name="deckId" value={deckId} />
          
          {/* Front content */}
          <div className="space-y-2">
            <Label htmlFor="front">Front</Label>
            <Textarea
              id="front"
              name="front"
              placeholder="Enter the question, term, or prompt..."
              className="min-h-[80px]"
              defaultValue={currentFront}
              disabled={isSubmitting}
            />
            {state.errors?.front && (
              <p className="text-sm text-destructive">{state.errors.front[0]}</p>
            )}
          </div>

          {/* Back content */}
          <div className="space-y-2">
            <Label htmlFor="back">Back</Label>
            <Textarea
              id="back"
              name="back"
              placeholder="Enter the answer, definition, or explanation..."
              className="min-h-[80px]"
              defaultValue={currentBack}
              disabled={isSubmitting}
            />
            {state.errors?.back && (
              <p className="text-sm text-destructive">{state.errors.back[0]}</p>
            )}
          </div>

          {/* General form errors */}
          {state.errors?._form && (
            <div className="rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{state.errors._form[0]}</p>
            </div>
          )}

          {/* Success message */}
          {state.success && (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-700">Card updated successfully!</p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Card
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
