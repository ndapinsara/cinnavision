"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The farmer dashboard renders on the server, so re-reading Mongo is just a
// router refresh — this keeps that one interaction out of the page itself.
const RefreshButton = ({
  label = "Refresh",
  className,
}: {
  label?: string;
  className?: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      aria-label={label || "Refresh"}
      className={cn("h-10 shrink-0 rounded-xl", className)}
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
};

export default RefreshButton;
