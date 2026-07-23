"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  markDealWon,
  markDealLost,
  reopenDeal,
} from "@/app/app/[workspace]/deals/actions";
import type { DealStatus } from "@crm/shared";

export function DealStatusActions({
  workspaceSlug,
  dealId,
  status,
}: {
  workspaceSlug: string;
  dealId: string;
  status: DealStatus;
}) {
  const [showLostForm, setShowLostForm] = useState(false);

  if (status === "won") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-green-600">Won</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => reopenDeal(workspaceSlug, dealId)}
        >
          Reopen
        </Button>
      </div>
    );
  }

  if (status === "lost") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-destructive text-sm font-medium">Lost</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => reopenDeal(workspaceSlug, dealId)}
        >
          Reopen
        </Button>
      </div>
    );
  }

  if (showLostForm) {
    return (
      <form
        action={(formData) => markDealLost(workspaceSlug, dealId, formData)}
        className="flex items-center gap-2"
      >
        <Input
          name="lost_reason"
          placeholder="Reason (optional)"
          className="h-8 w-48"
        />
        <Button type="submit" size="sm" variant="destructive">
          Confirm lost
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowLostForm(false)}
        >
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => markDealWon(workspaceSlug, dealId)}>
        Mark won
      </Button>
      <Button size="sm" variant="outline" onClick={() => setShowLostForm(true)}>
        Mark lost
      </Button>
    </div>
  );
}
