import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Define alert variants using class-variance-authority
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Alert component
const Alert = React.forwardRef(function Alert(
  { className, variant, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

// AlertTitle component
const AlertTitle = React.forwardRef(function AlertTitle(
  { className, children, ...props }, // Added `children` to destructure
  ref
) {
  return (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    >
      {children || "Default Title"} {/* Fallback content */}
    </h5>
  );
});
AlertTitle.displayName = "AlertTitle";
// AlertDescription component
const AlertDescription = React.forwardRef(function AlertDescription(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
});
AlertDescription.displayName = "AlertDescription";

// Export components
export { Alert, AlertTitle, AlertDescription };