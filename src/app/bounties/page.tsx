"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBounties } from "@/components/bounties-provider"
import { BountyCard } from "@/components/bounty-card"
import { CategoryButtonsSkeleton } from "@/components/skeletons/category-buttons-skeleton"
import { useState } from "react"
import { BountyCardsSkeletonGrid } from "@/components/skeletons/bounty-card-skeleton"
import { cn } from "@/lib/utils"

export default function BountiesPage() {
  const { activeBounties, inactiveBounties, categoryNames: categories, categoriesLoading, bountiesLoading } = useBounties()
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  const filteredActiveBounties =
    selectedCategory === "All Categories"
      ? activeBounties
      : activeBounties.filter((bounty) => bounty?.category?.name === selectedCategory)

  const filteredInactiveBounties =
    selectedCategory === "All Categories"
      ? inactiveBounties
      : inactiveBounties.filter((bounty) => bounty?.category?.name === selectedCategory)

  return (
    <div className="bg-black">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className={cn("grid w-full grid-cols-2 backdrop-blur-sm bg-[var(--color-bg-secondary)]")}>
            <TabsTrigger value="active" className="text-white hover:bg-[var(--color-primary-brand)] hover:text-black data-[state=active]:bg-[var(--color-primary-brand)] data-[state=active]:text-black data-[state=active]:opacity-100">
              Active Bounties ({activeBounties.length})
            </TabsTrigger>
            <TabsTrigger value="finalized" className="text-white hover:bg-[var(--color-primary-brand)] hover:text-black data-[state=active]:bg-[var(--color-primary-brand)] data-[state=active]:text-black data-[state=active]:opacity-100">
              Finalized Bounties ({inactiveBounties.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn("text-xl font-bold text-[var(--color-text-primary)]")}>Currently Active</h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {
                  categoriesLoading ? (
                    <CategoryButtonsSkeleton />
                  ) : (
                    categories.length > 0 && categories.map((cat) => (<Button
                      key={cat}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "font-bold hover:opacity-90 transition-all border-[var(--color-primary-brand)]",
                        selectedCategory === cat 
                          ? "bg-[var(--color-primary-brand)] text-black" 
                          : "bg-transparent text-[var(--color-primary-brand)]"
                      )}
                    >
                      {cat}
                    </Button>))
                  )
                }
              </div>
            </div>

            {
              bountiesLoading ? (
                <BountyCardsSkeletonGrid />
              ) : (
                filteredActiveBounties.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                    {
                      filteredActiveBounties.map((bounty) => (
                        <BountyCard
                          key={bounty.id}
                          bounty={bounty}
                        />
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-center text-white bg-zinc-800 py-4 px-2 rounded-md">
                    No active bounties at the moment. Please check back later!
                  </p>
                )
              )
            }
          </TabsContent>

          <TabsContent value="finalized" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn("text-xl font-bold text-[var(--color-text-primary)]")}>Completed Bounties</h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {
                  categoriesLoading ? (
                    <CategoryButtonsSkeleton />
                  ) : (
                    categories.length > 0 && categories.map((cat) => (<Button
                      key={cat}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "font-bold hover:opacity-90 transition-all border-[var(--color-primary-brand)]",
                        selectedCategory === cat 
                          ? "bg-[var(--color-primary-brand)] text-black" 
                          : "bg-transparent text-[var(--color-primary-brand)]"
                      )}
                    >
                      {cat}
                    </Button>))
                  )
                }
              </div>
            </div>

            {
              bountiesLoading ? (
                <BountyCardsSkeletonGrid />) : (

                filteredInactiveBounties.length > 0 ? (

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredInactiveBounties.map((bounty) => (
                      <BountyCard
                        key={bounty.id}
                        bounty={bounty}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-white bg-zinc-800 py-4 px-2 rounded-md">
                    No active bounties at the moment. Please check back later!
                  </p>
                )
              )
            }
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
