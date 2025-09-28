import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const { userId } = await auth();
  
  // If user is already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            Vocabo
          </h1>
          <p className="text-2xl text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <SignInButton>
            <Button size="lg" variant="default">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button size="lg" variant="outline">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
