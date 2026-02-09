import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const SignInSkeleton = () => {
  return (
    <Card className="w-full border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95">
      <CardHeader className="text-center space-y-4">
        {/* Logo skeleton */}
        <Skeleton className="h-12 w-12 rounded-xl mx-auto" />

        {/* Title skeleton */}
        <Skeleton className="h-8 w-32 mx-auto" />

        {/* Description skeleton */}
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input fields skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Checkbox skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Divider skeleton */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Skeleton className="w-full h-px" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Social buttons skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Footer link skeleton */}
        <div className="text-center">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
};

export const SignUpSkeleton = () => {
  return <SignInSkeleton />; // Same layout for both
};
