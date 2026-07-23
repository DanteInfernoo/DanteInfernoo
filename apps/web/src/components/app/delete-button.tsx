"use client";

import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Are you sure?",
}: {
  action: () => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={() => {
        if (confirm(confirmMessage)) action();
      }}
    >
      <Button type="submit" variant="outline">
        {label}
      </Button>
    </form>
  );
}
