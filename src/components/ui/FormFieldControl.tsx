import React from "react";
import type { FieldError } from "react-hook-form";

interface FormFieldControlProps {
  error?: FieldError | string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldControl({
  error,
  children,
  className = "flex flex-col flex-1 min-w-0",
}: FormFieldControlProps) {
  const errorMessage = typeof error === "string" ? error : error?.message;

  return (
    <div className={className}>
      {children}
      {errorMessage && (
        <span className="ql-field-error-text">{errorMessage}</span>
      )}
    </div>
  );
}
