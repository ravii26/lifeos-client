import * as React from "react";
import { Calendar, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

type DateInputProps = React.ComponentProps<"input"> & {
  variant?: "date" | "time" | "datetime-local";
};

function DateInput({ className, variant = "date", ...props }: DateInputProps) {
  const Icon = variant === "time" ? Clock : Calendar;
  return (
    <div className="relative">
      <input
        type={variant}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent pl-3 pr-9 py-1 text-sm text-tx shadow-xs transition-[color,box-shadow] outline-none",
          "placeholder:text-tx-4",
          "focus:border-ring focus:ring-ring/50 focus:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive",
          "[color-scheme:dark]",
          className,
        )}
        {...props}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tx-3">
        <Icon className="size-4" />
      </span>
    </div>
  );
}

export { DateInput };
