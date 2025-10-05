import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { AuthRedirect } from "@/components/auth-redirect";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Vocabo",
  description: "Vocabulary learning app with Clerk Authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark">
        <body
          className={`${poppins.variable} antialiased`}
        >
          {/* Client-side redirect component for post-authentication */}
          <AuthRedirect />
          <header className="flex justify-between items-center p-4 border-b">
            <h1 className="text-xl font-semibold">Vocabo</h1>
            <div className="flex gap-2">
              <SignedOut>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" size="default">
                      Sign in
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
                    <Button variant="outline" size="default" className="bg-green-600 text-white hover:bg-green-500 border-green-600">
                      Sign up
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader className="sr-only">
                      <DialogTitle>Sign Up</DialogTitle>
                    </DialogHeader>
                    <SignUp afterSignUpUrl="/dashboard" />
                  </DialogContent>
                </Dialog>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
