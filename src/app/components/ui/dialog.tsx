"use client";

import * as React from "react";

// Minimal dialog implementation using state and simple markup.
// Exports: Dialog (wrapper), DialogTrigger, DialogContent, DialogHeader, DialogTitle

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Dialog = ({ children }: DialogProps) => {
  return <div>{children}</div>;
};

export const DialogTrigger = ({ children, asChild, ...props }: any) => {
  // If asChild is true, render children directly and pass props via clone
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
};

export const DialogContent = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center p-6 ${className}`}
      {...props}
    >
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 border-b border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h3>
);

export default Dialog;
