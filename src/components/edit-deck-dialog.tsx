"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { updateDeckAction, type UpdateDeckFormState } from "@/actions/decks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2 } from "lucide-react";

interface EditDeckDialogProps {
  deckId: number;
  currentTitle: string;
  currentDescription?: string | null;
  children?: React.ReactNode;
  className?: string;
}

export function EditDeckDialog({ 
  deckId, 
  currentTitle, 
  currentDescription, 
  children, 
  className 
}: EditDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialState: UpdateDeckFormState = {};
  const [state, formAction] = useActionState(updateDeckAction, initialState);

  // Close dialog and reset form when deck is successfully updated
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
          <Button variant="outline" className={className}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
          <DialogDescription>
            Update the title and description for this deck.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          {/* Hidden field for deck ID */}
          <input type="hidden" name="deckId" value={deckId} />
          
          {/* Title field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter deck title..."
              defaultValue={currentTitle}
              disabled={isSubmitting}
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter deck description (optional)..."
              className="min-h-[80px]"
              defaultValue={currentDescription || ""}
              disabled={isSubmitting}
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">{state.errors.description[0]}</p>
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
              <p className="text-sm text-green-700">Deck updated successfully!</p>
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
                  Update Deck
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
