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
import { useSolana } from "@/components/solana/use-solana"
import { cn } from "@/lib/utils"
import { BountyCard } from "@/components/bounty-card"
import { BountyCardSkeleton } from "@/components/skeletons/bounty-card-skeleton"
import Link from "next/link"

export default function AdminPanel() {
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  const { connected } = useSolana()
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

  // Show loading while admin status is being determined
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Show 404 if wallet is connected but user is not admin
  if (connected && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-black">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-24 h-24 flex items-center justify-center bg-muted rounded-full">
                <span className="text-4xl font-bold text-muted-foreground">404</span>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Page Not Found
                </h1>
                <p className="text-muted-foreground">
                  The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/" className="w-full">
                  <Button className="w-full">
                    Back to Home
                  </Button>
                </Link>
                
                <Link href="/bounties" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Bounties
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Please connect your wallet to access the admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bounties" className="space-y-6">
          <TabsList className={cn("grid w-full grid-cols-2 backdrop-blur-sm bg-[var(--color-bg-secondary)]")}>
            <TabsTrigger value="bounties" className="text-white hover:bg-[var(--color-primary-brand)] hover:text-black data-[state=active]:bg-[var(--color-primary-brand)] data-[state=active]:text-black">
              Bounties
            </TabsTrigger>
            <TabsTrigger value="create" className="text-white hover:bg-[var(--color-primary-brand)] hover:text-black data-[state=active]:bg-[var(--color-primary-brand)] data-[state=active]:text-black">
              Create Bounty
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bounties" className="space-y-6 ">
            <Card className={cn("border-0 shadow-lg backdrop-blur-sm py-8 bg-[var(--color-bg-secondary)]")}>
              <CardHeader>
                <CardTitle className={cn("text-[var(--color-primary-brand)]")}>Active Bounties Management</CardTitle>
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
            <Card className={cn("border-0 shadow-lg backdrop-blur-sm py-6 bg-[var(--color-bg-secondary)]")}>
              <CardHeader>
                <CardTitle className={cn("text-[var(--color-primary-brand)]")}>Create New Bounty</CardTitle>
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
                              <SelectItem key={id} value={id.toString()} className="text-white">
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

                  <Card className={cn("border-none py-4 bg-[var(--color-bg-tertiary)]")}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className={cn("text-lg text-[var(--color-primary-brand)]")}>Prize Distribution</CardTitle>
                          <CardDescription>Set rewards for each winner position</CardDescription>
                        </div>
                        <Button
                          type="button"
                          onClick={addWinnerPosition}
                          size="sm"
                          className={cn("bg-[var(--color-primary-brand)] text-black border border-[var(--color-primary-brand)] hover:bg-transparent hover:text-[var(--color-primary-brand)] hover:border-[var(--color-primary-brand)]")}
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
                          <div key={index} className={cn("flex items-center gap-4 p-3 rounded-lg bg-[var(--color-bg-secondary)]")}>
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-brand)]")}>
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
                                className={cn("flex-shrink-0 bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)] border-[var(--color-status-error-bg)] hover:bg-transparent hover:text-[var(--color-primary-brand)] hover:border-[var(--color-primary-brand)]")}
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
                        <span className={cn("text-lg font-bold text-[var(--color-primary-brand)]")}>
                          {calculateTotalPrize().toLocaleString()} SSX
                        </span>
                      </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      className={cn(
                        isSubmitting 
                          ? "opacity-50 cursor-not-allowed pointer-events-none bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]" 
                          : "bg-[var(--color-primary-brand)] text-black border border-[var(--color-primary-brand)] hover:bg-transparent hover:text-[var(--color-primary-brand)] hover:border-[var(--color-primary-brand)]"
                      )}
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
