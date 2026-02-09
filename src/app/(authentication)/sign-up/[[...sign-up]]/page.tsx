import { SignInSkeleton } from "@/features/auth/components";
import { SignUp } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUpPage() {
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-neon-green bg-clip-text text-transparent">
          Join Catan
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Create your account and start building your empire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUp
          fallback={<SignInSkeleton />}
          routing="path"
          path="/sign-up"
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
