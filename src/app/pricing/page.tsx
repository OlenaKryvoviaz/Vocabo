import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Unlock the full potential of your flashcard learning experience
        </p>
      </div>
      
      <PricingTable />
      
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include access to your flashcard decks and study sessions
        </p>
      </div>
    </div>
  );
}

