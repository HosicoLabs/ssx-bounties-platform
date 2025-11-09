'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CategoryButtonsSkeleton } from "@/components/skeletons/category-buttons-skeleton"
import { useBounties } from "@/components/bounties-provider"
import { BountyCardsSkeletonGrid } from "@/components/skeletons/bounty-card-skeleton"
import { BountyCard } from "@/components/bounty-card"
import { useAdmin } from "@/components/admin/use-admin"

export default function Home() {
  const { categoryNames: categories, categoriesLoading, activeBounties, bountiesLoading } = useBounties()
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  const filteredBounties =
    selectedCategory === "All Categories"
      ? activeBounties
      : activeBounties.filter((bounty) => bounty?.category?.name === selectedCategory)

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-0 shadow-xl overflow-auto" style={{ backgroundColor: "#000" }}>
          <CardContent className="p-0 relative">
            <div 
              className="w-full h-64 bg-cover bg-center opacity-80" 
              style={{ backgroundImage: "url('/images/ssx-banner.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#000]/80 to-[#000]/60"></div>
            <div className="absolute inset-0 p-8 flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-2/3 mb-6 lg:mb-0 z-10">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Earn <span className="text-[#fdc700]">$</span>SSX Tokens by Contributing to Our Community
                </h2>
                <p className="text-lg opacity-90 text-white">
                  Join bounty challenges, showcase your skills, and get rewarded with SSX tokens. From creative
                  content to technical development - there&apos;s something for everyone!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 gap-5">
            <h3 className="text-2xl font-bold text-[#fff]">Active Bounties</h3>
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
            bountiesLoading || isAdminLoading ? (
              <BountyCardsSkeletonGrid />
            ) : (
              filteredBounties.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBounties.map((bounty) => (
                    <BountyCard key={bounty.id} isAdmin={isAdmin} bounty={bounty} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-white bg-zinc-800 py-4 px-2 rounded-md">
                  No active bounties at the moment. Please check back later!
                </p>
              )
            )
          }
        </div>
      </main>
    </div>
  )
}
