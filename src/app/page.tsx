import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn, SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { AuthRedirect } from "@/components/auth-redirect";

export default async function HomePage() {
  const { userId } = await auth();
  
  // If user is already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      {/* Client-side redirect component for post-authentication */}
      <AuthRedirect />
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
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="default">
                Sign In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="sr-only">
                <DialogTitle>Sign In</DialogTitle>
              </DialogHeader>
              <SignIn afterSignInUrl="/dashboard" />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="sr-only">
                <DialogTitle>Sign Up</DialogTitle>
              </DialogHeader>
              <SignUp afterSignUpUrl="/dashboard" />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
