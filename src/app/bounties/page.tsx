"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBounties } from "@/components/bounties-provider"
import { BountyCard } from "@/components/bounty-card"
import { CategoryButtonsSkeleton } from "@/components/skeletons/category-buttons-skeleton"
import { useState } from "react"
import { BountyCardsSkeletonGrid } from "@/components/skeletons/bounty-card-skeleton"

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
    <div className="min-h-screen bg-gradient-to-br from-[#1c398e]/5 to-[#ff6900]/5">
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="active" className="data-[state=active]:bg-[#ff6900] data-[state=active]:text-white">
              Active Bounties ({activeBounties.length})
            </TabsTrigger>
            <TabsTrigger value="finalized" className="data-[state=active]:bg-[#ff6900] data-[state=active]:text-white">
              Finalized Bounties ({inactiveBounties.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1c398e]">Currently Active</h3>
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
                      className={
                        selectedCategory === cat
                          ? "bg-[#fdc700] text-[#1c398e] border-[#fdc700] font-bold"
                          : "hover:bg-[#fdc700]/20 text-[#1c398e]"
                      }
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
                  <p className="text-center text-muted-foreground bg-gray-100 py-4 px-2 rounded-md">
                    No active bounties at the moment. Please check back later!
                  </p>
                )
              )
            }
          </TabsContent>

          <TabsContent value="finalized" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1c398e]">Completed Bounties</h3>
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
                      className={
                        selectedCategory === cat
                          ? "bg-[#fdc700] text-[#1c398e] border-[#fdc700] font-bold"
                          : "hover:bg-[#fdc700]/20 text-[#1c398e]"
                      }
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
                  <p className="text-center text-muted-foreground bg-gray-100 py-4 px-2 rounded-md">
                    No active bounties at the moment. Please check back later!
                  </p>
                )
              )
            }
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
