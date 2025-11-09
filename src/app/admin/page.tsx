"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { useAdmin } from "@/components/admin/use-admin"
import { useBounties } from "@/components/bounties-provider"
import { cn } from "@/lib/utils"
import { BountyCard } from "@/components/bounty-card"
import { BountyCardSkeleton } from "@/components/skeletons/bounty-card-skeleton"

export default function AdminPanel() {
  const { isAdmin } = useAdmin()
  const { categories, activeBounties, bountiesLoading, refreshBounties } = useBounties()

  const [bountyTitle, setBountyTitle] = useState("")
  const [bountyDescription, setBountyDescription] = useState("")
  const [bountyRequirements, setBountyRequirements] = useState("")
  const [bountyCategory, setBountyCategory] = useState<null | number>(null)
  const [bountyEndDate, setBountyEndDate] = useState("")
  const [bountyPrizes, setBountyPrizes] = useState([
    { place: "1st", prize: "" },
    { place: "2nd", prize: "" },
    { place: "3rd", prize: "" },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const addWinnerPosition = () => {
    const nextPlace = `${bountyPrizes.length + 1}${getOrdinalSuffix(bountyPrizes.length + 1)}`
    setBountyPrizes([...bountyPrizes, { place: nextPlace, prize: "" }])
  }

  const removeWinnerPosition = (index: number) => {
    if (bountyPrizes.length > 1) {
      setBountyPrizes(bountyPrizes.filter((_, i) => i !== index))
    }
  }

  const updateWinnerPrize = (index: number, prize: string) => {
    const updated = [...bountyPrizes]
    updated[index].prize = prize
    setBountyPrizes(updated)
  }

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return "st"
    if (j === 2 && k !== 12) return "nd"
    if (j === 3 && k !== 13) return "rd"
    return "th"
  }

  const calculateTotalPrize = () => {
    return bountyPrizes.reduce((total, position) => {
      return total + (Number.parseFloat(position.prize) || 0)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()

      if (!bountyTitle || !bountyDescription || !bountyRequirements || !bountyCategory || !bountyEndDate || bountyPrizes.length === 0) {
        throw new Error("Please fill in all required fields.")
      }

      const formData = JSON.stringify({
        bounty: {
          title: bountyTitle,
          description: bountyDescription,
          requirements: bountyRequirements,
          category: bountyCategory,
          end_date: bountyEndDate,
          prizes: bountyPrizes,
        }
      })

      setIsSubmitting(true)

      const response = await fetch("/api/admin/bounty/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create bounty")
      }

      (e.target as HTMLFormElement).reset()
      setIsSuccess(true)
      setError(null)
      setBountyTitle("")
      setBountyDescription("")
      setBountyRequirements("")
      setBountyCategory(null)
      setBountyEndDate("")
      setBountyPrizes([{ place: "1st", prize: "" }, { place: "2nd", prize: "" }, { place: "3rd", prize: "" }])
      await refreshBounties()
    } catch (err) {
      console.error("Failed to create bounty", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <p></p>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bounties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800 backdrop-blur-sm">
            <TabsTrigger value="bounties" className="data-[state=active]:bg-[#F2C700] data-[state=active]:text-black text-white">
              Bounties
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-[#F2C700] data-[state=active]:text-black text-white">
              Create Bounty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bounties" className="space-y-6 ">
            <Card className="border-0 shadow-lg bg-zinc-800 backdrop-blur-sm py-8">
              <CardHeader>
                <CardTitle className="text-[#F2C700]">Active Bounties Management</CardTitle>
                <CardDescription>Monitor and manage currently active bounties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                  {
                    bountiesLoading ? (
                      <BountyCardSkeleton />
                    ) : (
                      activeBounties.length === 0 ? (
                        <p className="text-center text-white bg-zinc-900 py-4 px-2 rounded-md">
                          No active bounties at the moment. Please check back later!
                        </p>
                      ) : (

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {
                            activeBounties.map((bounty) => (
                              <BountyCard key={bounty.id} isAdmin={isAdmin} bounty={bounty} />))
                          }
                        </div>
                      )
                    )
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="border-0 shadow-lg bg-zinc-800 backdrop-blur-sm py-6">
              <CardHeader>
                <CardTitle className="text-[#F2C700]">Create New Bounty</CardTitle>
                <CardDescription>Set up a new bounty challenge for the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1">
                    <div className="space-y-4 mb-4">
                      <div>
                        <Label className="text-white mb-3" htmlFor="title">Bounty Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter bounty title"
                          className="text-zinc-400 border-zinc-600"
                          required
                          disabled={isSubmitting}
                          onChange={(e) => setBountyTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-3" htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          className="text-zinc-400 border-zinc-600"
                          placeholder="Provide detailed description of the bounty requirements..."
                          rows={4}
                          required
                          disabled={isSubmitting}
                          onChange={(e) => setBountyDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-3" htmlFor="requirements">Requirements & Guidelines</Label>
                        <Textarea
                          id="requirements"
                          className="text-zinc-400 border-zinc-600"
                          placeholder="List specific requirements, submission guidelines, and evaluation criteria..."
                          rows={4}
                          required
                          disabled={isSubmitting}
                          onChange={(e) => setBountyRequirements(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-4 md:grid-cols-2 gap-6 md:grid">
                      <div>
                        <Label className="text-white mb-3" htmlFor="category">Category</Label>
                        <Select disabled={isSubmitting} required onValueChange={(value) => setBountyCategory(Number(value))}>
                          <SelectTrigger className="text-zinc-400 border-zinc-600">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {categories.map(({ id, name }) => (
                              <SelectItem key={id} value={id.toString()} className="text-white hover:bg-zinc-700 hover:text-[#F2C700] focus:bg-zinc-700 focus:text-[#F2C700]">
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white mb-3" htmlFor="duration">Duration (days)</Label>
                        <Input required disabled={isSubmitting} id="duration" placeholder="Enter duration in days" type="date" className="text-zinc-400 border-zinc-600 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100" onChange={(e) => setBountyEndDate(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <Card className="border-none bg-zinc-900 py-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-[#F2C700]">Prize Distribution</CardTitle>
                          <CardDescription>Set rewards for each winner position</CardDescription>
                        </div>
                        <Button
                          type="button"
                          onClick={addWinnerPosition}
                          size="sm"
                          className="bg-[#F2C700] hover:bg-[#F2C700]/90 text-black"
                          disabled={isSubmitting}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Winner
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {bountyPrizes.map((position, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-zinc-800 rounded-lg">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <div className="w-8 h-8 bg-[#fdc700] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-black">{position.place}</span>
                              </div>
                              <div className="flex-1">
                                <Label className="text-white mb-3 text-sm" htmlFor={`prize-${index}`}>
                                  {position.place} Place Prize (SSX)
                                </Label>
                                <Input
                                  id={`prize-${index}`}
                                  placeholder="Enter prize amount"
                                  type="number"
                                  value={position.prize}
                                  onChange={(e) => updateWinnerPrize(index, e.target.value)}
                                  className="mt-1 text-zinc-400 border-zinc-600"
                                  required
                                  disabled={isSubmitting}
                                />
                              </div>
                            </div>
                            {bountyPrizes.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeWinnerPosition(index)}
                                size="sm"
                                variant="outline"
                                className="flex-shrink-0 bg-[#ff4d4d] hover:bg-[#ff4d4d]/90 text-black border-none "
                                disabled={isSubmitting}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <Label className="text-white mb-3 text-base font-semibold">Total Prize Pool</Label>
                          <span className="text-lg font-bold text-[#F2C700]">
                            {calculateTotalPrize().toLocaleString()} SSX
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      className={cn("hover:bg-[#F2C700]/90 text-black", isSubmitting ? "opacity-50 cursor-not-allowed pointer-events-none bg-gray-400" : "bg-[#F2C700] ")}
                      disabled={isSubmitting}
                    >Create Bounty</Button>
                  </div>
                </form>

                {isSuccess ? (
                  <p className="text-green-600 font-medium">Bounty created successfully!</p>
                ) : error ? (
                  <p className="text-red-600 font-medium">Error: {error}</p>
                ) : ""}

                {
                  isSubmitting ? (
                    <p className="text-muted-foreground">Submitting bounty...</p>
                  ) : ""
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
