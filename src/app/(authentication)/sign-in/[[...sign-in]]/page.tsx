import { SignInSkeleton } from "@/features/auth/components";
import { SignIn } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  return (
    <Card className="w-full border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-neon-green rounded-xl flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-neon-green bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your credentials to access your Catan account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignIn
          fallback={<SignInSkeleton />}
          routing="path"
          path="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0 bg-transparent p-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border-border hover:bg-accent transition-all duration-200",
              formButtonPrimary:
                "bg-gradient-to-r from-primary to-neon-green hover:from-primary/90 hover:to-neon-green/90 shadow-lg shadow-primary/25",
              formFieldInput:
                "border-border bg-background focus:border-primary/50 transition-all duration-200",
              footerActionLink:
                "text-primary hover:text-primary/80 transition-colors",
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
