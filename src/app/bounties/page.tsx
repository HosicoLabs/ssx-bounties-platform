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
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800 backdrop-blur-sm">
            <TabsTrigger value="active" className="data-[state=active]:bg-[#F2C700] data-[state=active]:text-black text-white">
              Active Bounties ({activeBounties.length})
            </TabsTrigger>
            <TabsTrigger value="finalized" className="data-[state=active]:bg-[#F2C700] data-[state=active]:text-black text-white">
              Finalized Bounties ({inactiveBounties.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#fff]">Currently Active</h3>
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
                        ? "bg-[#fdc700] text-black border-[#fdc700] font-bold hover:bg-transparent hover:text-[#fdc700]"
                        : "bg-transparent text-[#fdc700] border-[#fdc700] hover:bg-[#fdc700]"
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
                  <p className="text-center text-white bg-zinc-800 py-4 px-2 rounded-md">
                    No active bounties at the moment. Please check back later!
                  </p>
                )
              )
            }
          </TabsContent>

          <TabsContent value="finalized" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#fff]">Completed Bounties</h3>
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
                        ? "bg-[#fdc700] text-black border-[#fdc700] font-bold hover:bg-transparent hover:text-[#fdc700]"
                        : "bg-transparent text-[#fdc700] border-[#fdc700] hover:bg-[#fdc700]"
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
                  <p className="text-center text-white bg-zinc-800 py-4 px-2 rounded-md">
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
