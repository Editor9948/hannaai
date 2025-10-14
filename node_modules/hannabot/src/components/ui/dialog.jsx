"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = React.forwardRef(function DialogContent(
  { className, children, ...props },
  ref
) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
          className
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none">
          ✕
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export const DialogHeader = ({ children, className, ...props }) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className, ...props }) => (
  <h2
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}
  >
    {children}
  </h2>
);

export const DialogDescription = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-gray-500", className)} {...props}>
    {children}
  </p>
);