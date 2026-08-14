import { cn } from "@healthalst/ui/lib/utils";
import { ComponentProps } from "react";

function PageContainer({ className, ...properties }: ComponentProps<"div">) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
        className,
      )}
      {...properties}
    />
  );
}

export { PageContainer };
