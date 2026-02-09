import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center p-4 text-sm text-muted-foreground">
        <p>© 2024 Online Catan. Built with passion for gaming.</p>
      </div>
    </div>
  );
}
