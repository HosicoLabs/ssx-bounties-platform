// providers/BountiesProvider.tsx
"use client";

import * as React from "react";
import type { ReactNode } from "react";
import type { Bounty, BountyCategory } from "@/app/types";

type BountiesContextValue = {
  // categories
  categories: BountyCategory[];
  categoryNames: string[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  refreshCategories: () => Promise<void>;

  // bounties
  bounties: Bounty[];
  activeBounties: Bounty[];
  inactiveBounties: Bounty[];
  bountiesLoading: boolean;
  bountiesError: string | null;
  refreshBounties: () => Promise<void>;
};

const BountiesContext = React.createContext<BountiesContextValue | undefined>(
  undefined
);

type Props = {
  children: ReactNode;
  initialCategories?: BountyCategory[];
  initialBounties?: Bounty[];
};

function endOfDay(dateLike: string): Date {
  const d = new Date(dateLike);
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateLike);
  if (isDateOnly) {
    d.setHours(23, 59, 59, 999);
  }
  return d;
}

function splitBountiesByStatus(bounties: Bounty[]) {
  const now = new Date();
  const active: Bounty[] = [];
  const inactive: Bounty[] = [];
  for (const b of bounties) {
    if (now > endOfDay(b.end_date)) inactive.push(b);
    else active.push(b);
  }
  return { active, inactive };
}

export function BountiesProvider({
  children,
  initialCategories,
  initialBounties,
}: Props) {
  const [categories, setCategories] = React.useState<BountyCategory[]>(
    initialCategories ?? []
  );
  const [categoriesLoading, setCategoriesLoading] = React.useState<boolean>(
    !initialCategories
  );
  const [categoriesError, setCategoriesError] = React.useState<string | null>(
    null
  );

  const [bounties, setBounties] = React.useState<Bounty[]>(
    initialBounties ?? []
  );
  const [bountiesLoading, setBountiesLoading] = React.useState<boolean>(
    !initialBounties
  );
  const [bountiesError, setBountiesError] = React.useState<string | null>(null);

  const refreshCategories = React.useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as { categories: BountyCategory[] };
      setCategories(json.categories ?? []);
    } catch (e) {
      console.error("Failed to fetch categories", e);
      setCategoriesError((e as Error).message ?? "Failed to fetch categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const refreshBounties = React.useCallback(async () => {
    setBountiesLoading(true);
    setBountiesError(null);
    try {
      const res = await fetch("/api/bounties", { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as { bounties: Bounty[] };
      setBounties(json.bounties ?? []);
    } catch (e) {
      console.error("Failed to fetch bounties", e);
      setBountiesError((e as Error).message ?? "Failed to fetch bounties");
    } finally {
      setBountiesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialCategories) void refreshCategories();
    if (!initialBounties) void refreshBounties();
  }, [initialCategories, initialBounties, refreshCategories, refreshBounties]);

  const categoryNames = React.useMemo(
    () => ["All Categories", ...categories.map((c) => c.name)],
    [categories]
  );

  const { active: activeBounties, inactive: inactiveBounties } =
    React.useMemo(() => splitBountiesByStatus(bounties), [bounties]);

  const value: BountiesContextValue = {
    // categories
    categories,
    categoryNames,
    categoriesLoading,
    categoriesError,
    refreshCategories,

    // bounties
    bounties,
    activeBounties,
    inactiveBounties,
    bountiesLoading,
    bountiesError,
    refreshBounties,
  };

  return (
    <BountiesContext.Provider value={value}>
      {children}
    </BountiesContext.Provider>
  );
}

export function useBounties() {
  const ctx = React.useContext(BountiesContext);
  if (!ctx) throw new Error("useBounties must be used within a BountiesProvider");
  return ctx;
}
