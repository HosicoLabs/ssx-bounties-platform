"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Coins, Clock, FileText, ArrowLeft, CheckCircle, Crown, Check, X } from "lucide-react";
import { useAdmin } from "@/components/admin/use-admin";
import { calculateTotalPrize, isEnded } from "@/utils/bounties";
import { cn } from "@/lib/utils";
import { useSolana } from "@/components/solana/use-solana";
import { WalletDropdown } from "@/components/wallet-dropdown";
import { Bounty, Submission } from "@/app/types";

export default function BountyDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [bounty, setBounty] = useState<Bounty | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const { connected, wallet } = useSolana()
    const { isAdmin } = useAdmin();

    const [submission, setSubmission] = useState<Submission | null>(null);

    const [submissionLoading, setSubmissionLoading] = useState(false);
    const [twitterHandle, setTwitterHandle] = useState("");
    const [tweetLink, setTweetLink] = useState("");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    const [selectedWinners, setSelectedWinners] = useState<{ [key: number]: string }>({});
    const [isSelectingWinners, setIsSelectingWinners] = useState(false);
    const [selectedWinnersSuccess, setSelectedWinnersSuccess] = useState(false)
    const [selectedWinnersError, setSelectedWinnersError] = useState("")

    const fetchBounty = useCallback(async () => {
        let mounted = true;
        setLoading(true);
        setErr(null);

        try {
            const res = await fetch(`/api/bounties/${id}`, { cache: "no-store" });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "Failed to load bounty");
            if (!mounted) return;
            setBounty(json.bounty);
        } catch (err) {
            if (!mounted) return;
            const errorMessage = (err instanceof Error) ? err.message : "Failed to load bounty";
            setErr(errorMessage);
        } finally {
            if (mounted) setLoading(false);
        }

        return () => {
            mounted = false;
        };
    }, [id])

    useEffect(() => {
        fetchBounty()
    }, [id, fetchBounty]);

    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionLoading(true);

        try {

            if (!twitterHandle) {
                throw new Error("Twitter Handle is required");
            }

            const submissionPayload = {
                submission: {
                    bounty_id: Number(id),
                    wallet_address: wallet?.accounts[0]?.address,
                    twitter_handle: twitterHandle,
                    tweet_link: tweetLink || "",
                    extra_info: additionalInfo || "",
                }
            }

            let data = null;

            if (submission?.id) {
                data = await (await fetch("/api/submissions/update", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        submissionId: submission.id,
                        submission: submissionPayload.submission
                    }),
                })).json()
            } else {
                data = await (await fetch("/api/submissions/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(submissionPayload),
                })).json();
            }

            if (!data || data.error) {
                throw new Error(data?.error || "Failed to submit your entry");
            }

            setSubmission(data.submission);
            setSubmissionSuccess(true);
            setTimeout(() => setSubmissionSuccess(false), 3000);
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setSubmissionLoading(false);
        }
    };

    const handleWinnerSelection = (submissionId: number, position: string) => {
        setSelectedWinners(prev => {
            const next = { ...prev };
            if (position === "No Prize") {
                delete next[submissionId];
            } else {
                next[submissionId] = position;
            }
            return next;
        });
    };

    const announceWinners = async () => {
        setIsSelectingWinners(true);
        try {
            const data = await (await fetch("/api/admin/bounty/select-winners", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bountyId: Number(id),
                    winners: selectedWinners,
                }),
            })).json()

            if (data?.error) {
                throw new Error(data.error || "Failed to announce winners");
            }

            setSelectedWinnersSuccess(true)

            await fetchBounty()

            setTimeout(() => {
                setSelectedWinnersSuccess(false)
            }, 5000)
        } catch (err) {
            console.error("Error announcing winners:", err);
            setSelectedWinnersError((err as Error).message)
        } finally {
            setIsSelectingWinners(false)
        }
    };

    const findExistingSubmission = useCallback(async () => {
        if (!connected || !wallet?.accounts?.length || !bounty?.id || !id) return;

        try {
            const data = await (await fetch("/api/submissions/find", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bounty_id: Number(id),
                    wallet_address: wallet?.accounts[0]?.address,
                }),
            })).json()

            if (data?.submission?.id) {
                setSubmission(data.submission);
                setTwitterHandle(data.submission.twitter_handle || "");
                setTweetLink(data.submission.tweet_link || "");
                setAdditionalInfo(data.submission.extra_info || "");
            }
        } catch (err) {
            console.error("Error fetching existing submission:", err);
        }
    }, [connected, wallet?.accounts, id, bounty?.id]);

    useEffect(() => {
        findExistingSubmission()
    }, [wallet?.accounts, id, findExistingSubmission])

    if (loading) {
        return (
            <div className="min-h-screen bg-black grid place-items-center">
                <p className="text-sm text-zinc-400">Loading bounty…</p>
            </div>
        );
    }

    if (err || !bounty) {
        return (
            <div className="min-h-screen bg-black grid place-items-center">
                <div className="text-center">
                    <p className="font-semibold text-red-500">Failed to load bounty</p>
                    <p className="text-sm text-zinc-400">{err ?? "Not found"}</p>
                    <div className="mt-4">
                        <Link href="/"><Button variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">Back</Button></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <main className="container mx-auto px-4 py-8">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#F2C700] to-[#fdc700] rounded-full flex items-center justify-center">
                                <Trophy className="w-4 h-4 text-black" />
                            </div>
                            <h1 className="text-xl font-bold text-white">Bounty Details</h1>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-lg bg-zinc-800 backdrop-blur-sm py-4">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <Badge variant="outline" className="border-zinc-600 text-zinc-300 bg-zinc-900/50">
                                                {bounty.category?.name ?? "—"}
                                            </Badge>
                                            <Badge className={cn(isEnded(bounty?.end_date) ? "border-zinc-600 text-zinc-300 bg-zinc-900/50" : "bg-[#F2C700] text-black border-[#F2C700]")}>{isEnded(bounty.end_date) ? "Finalized" : "Active"}</Badge>
                                        </div>
                                        <CardTitle className="text-2xl text-white text-balance mb-2">
                                            {bounty.title}
                                        </CardTitle>
                                        <CardDescription className="text-base text-pretty text-zinc-400">
                                            {bounty.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Coins className="w-5 h-5 text-[#F2C700]" />
                                        <div>
                                            <p className="text-sm text-zinc-400">Total Reward</p>
                                            <p className="font-bold text-[#F2C700]">
                                                {calculateTotalPrize(bounty.prizes)} SSX
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-5 h-5 text-zinc-400" />
                                        <div>
                                            <p className="text-sm text-zinc-400">Submissions</p>
                                            <p className="font-bold text-white">{bounty.submissions && bounty.submissions.length > 0 ? bounty.submissions?.length : 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className={cn(isEnded(bounty.end_date) ? "w-5 h-5 text-red-500" : "text-[#F2C700]")} />
                                        <div>
                                            <p className="text-sm text-zinc-400">Ends</p>
                                            <p className={cn("font-bold", isEnded(bounty.end_date) ? "text-red-500" : "text-[#F2C700]")}>
                                                {new Date(bounty.end_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="details" className="space-y-6">
                            <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"} bg-zinc-800 backdrop-blur-sm`}>
                                <TabsTrigger value="details" className="data-[state=active]:bg-[#F2C700] data-[state=active]:text-black text-white">Details</TabsTrigger>
                                <TabsTrigger value="submit" className="data-[state=active]:bg-[#F2C700] data-[state=active]:text-black text-white">Submit Entry</TabsTrigger>
                                {isAdmin ? (
                                    <TabsTrigger value="winners" className="data-[state=active]:bg-[#F2C700] data-[state=active]:text-black text-white">Select Winners</TabsTrigger>
                                ) : ""}
                            </TabsList>

                            <TabsContent value="details">
                                <Card className="border-0 shadow-lg bg-zinc-800 backdrop-blur-sm py-8">
                                    <CardHeader>
                                        <CardTitle className="text-white">Submission Requirements</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <ul className="space-y-2">
                                                {(Array.isArray(bounty.requirements)
                                                    ? bounty.requirements
                                                    : String(bounty.requirements ?? "")
                                                        .split("\n")
                                                        .filter(Boolean)
                                                ).map((req, idx) => (
                                                    <li key={idx} className="flex items-start space-x-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-zinc-300">{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-white mb-3">Prize Distribution</h4>
                                            <div className="space-y-3">
                                                {(bounty.prizes ?? []).map((prize, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-[#F2C700] rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-bold text-black">{prize.place}</span>
                                                            </div>
                                                        </div>
                                                        <span className="font-bold text-[#F2C700]">{Number(prize.prize).toLocaleString()} SSX</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {
                                            !isEnded(bounty?.end_date) ? (
                                                <p className="text-center text-white bg-zinc-800 py-4 px-2 rounded-md">The winners will be announced once the bounty has been finalized.
                                                </p>
                                            ) : (

                                                bounty?.winners && bounty?.winners.length > 0 ? (
                                                    <div>
                                                        <h4 className="font-semibold text-white mb-3">Winners</h4>
                                                        <div className="space-y-3">
                                                            {
                                                                bounty?.winners.map(({ position, submission }) => (
                                                                    <Card key={submission.id} className="border border-zinc-700 bg-zinc-800">
                                                                        <CardContent className="p-4">
                                                                            <div className="flex items-start justify-between gap-10">
                                                                                <div className="flex-1">
                                                                                    <span className="text-xs text-zinc-400 inline-block mb-2">Participant</span>
                                                                                    <div className="flex items-center space-x-3 mb-2">
                                                                                        <Link href={`https://x.com/${submission.twitter_handle}`} target="_blank" rel="noopener noreferrer" >
                                                                                            <h4 className="font-semibold text-white underline">{submission.twitter_handle}</h4>
                                                                                        </Link>
                                                                                        <Badge className="bg-[#F2C700] text-black">

                                                                                            {position} Place
                                                                                        </Badge>
                                                                                    </div>
                                                                                    <ul className="mt-4 flex flex-col space-y-1 md:space-y-0 text-sm text-zinc-400">
                                                                                        <li>
                                                                                            <Link
                                                                                                href={submission.tweet_link}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="underline text-[#F2C700] hover:text-[#F2C700]/80"
                                                                                            >
                                                                                                Tweet link
                                                                                            </Link>
                                                                                        </li>

                                                                                        <li>
                                                                                            <p className="text-sm text-zinc-400 mt-5"><span className="font-semibold text-zinc-300">Wallet address:</span> {submission.wallet_address}</p>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            {
                                                                                submission?.extra_info ? (
                                                                                    <p className="text-sm text-zinc-400 mt-5"><span className="font-semibold text-zinc-300">Extra info:</span> {submission.extra_info}</p>
                                                                                ) : ""
                                                                            }
                                                                        </CardContent>
                                                                    </Card>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="font-semibold text-white mb-3">Winners</h4>
                                                        <p className="text-center text-white bg-zinc-900 py-4 px-2 rounded-md">The winners have not yet been announced.</p>
                                                    </>
                                                )
                                            )
                                        }



                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="submit">

                                <Card className="border-0 shadow-lg bg-zinc-800 backdrop-blur-sm py-8">
                                    <CardHeader>
                                        <CardTitle className="text-white">Submit Your Entry</CardTitle>
                                        <CardDescription className="text-zinc-400">Upload your submission for this bounty challenge</CardDescription>
                                        <p className="text-xs text-zinc-400">We can&apos;t wait to see what you&apos;ve created!</p>

                                    </CardHeader>
                                    <CardContent>
                                        {
                                            connected ? (
                                                <>
                                                    {
                                                        isEnded(bounty.end_date) ? (
                                                            <div className="p-6 text-center">
                                                                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
                                                                <h2 className="text-xl font-semibold text-white mb-2">Bounty Finalized</h2>
                                                            </div>
                                                        ) : ""
                                                    }

                                                    <form onSubmit={handleSubmission} className="space-y-6">

                                                        <div>
                                                            <Label htmlFor="tweet-link" className="text-sm font-medium text-white">Tweet Link <span className="text-red-500 ml-1">*</span></Label>
                                                            <p className="text-xs text-zinc-400 mb-2">
                                                                This helps sponsors discover (and maybe repost) your work on X!
                                                            </p>
                                                            <div className="flex">
                                                                <Input
                                                                    id="tweet-link"
                                                                    placeholder="Add a tweet's link"
                                                                    type="url"
                                                                    disabled={submissionLoading || isEnded(bounty.end_date)}
                                                                    value={tweetLink}
                                                                    onChange={(e) => setTweetLink(e.target.value)}
                                                                    className="text-zinc-400 border-zinc-600 focus:ring-2 focus:ring-[#F2C700] focus:border-[#F2C700]"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="twitter-handle" className="text-sm font-medium text-white flex items-center">
                                                                Twitter Handle <span className="text-red-500 ml-1">*</span>
                                                            </Label>
                                                            <p className="text-xs text-zinc-400 mb-2">Make sure this link is accessible by everyone!</p>
                                                            <div className="flex">
                                                                <Input
                                                                    id="twitter-handle"
                                                                    placeholder="Add your Twitter handle. e.g @SSX_on_sol"
                                                                    type="text"
                                                                    value={twitterHandle}
                                                                    disabled={submissionLoading || isEnded(bounty.end_date)}
                                                                    onChange={(e) => setTwitterHandle(e.target.value)}
                                                                    className="text-zinc-400 border-zinc-600 focus:ring-2 focus:ring-[#F2C700] focus:border-[#F2C700]"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>



                                                        <div>
                                                            <Label htmlFor="additional-info" className="text-sm font-medium text-white">Anything Else?</Label>
                                                            <div className="relative">
                                                                <Textarea
                                                                    id="additional-info"
                                                                    placeholder="Add info or link"
                                                                    rows={3}
                                                                    disabled={submissionLoading || isEnded(bounty.end_date)}
                                                                    value={additionalInfo}
                                                                    onChange={(e) => setAdditionalInfo(e.target.value)}
                                                                    className="text-zinc-400 border-zinc-600 focus:ring-2 focus:ring-[#F2C700] focus:border-[#F2C700] pr-10"
                                                                />
                                                                <div className="absolute right-3 top-3">
                                                                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center">
                                                                        <FileText className="w-3 h-3 text-zinc-400" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            type="submit"
                                                            className={cn("w-full bg-[#F2C700] hover:bg-[#F2C700]/90 text-black font-medium", isEnded(bounty.end_date) || submissionLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : "")}
                                                            disabled={!twitterHandle || submissionLoading || isEnded(bounty.end_date)}
                                                        >
                                                            {submission?.id ? "Update Submission" : "Submit Entry"}
                                                        </Button>

                                                        {
                                                            submissionLoading && <p className="text-sm text-zinc-400">Submitting your entry…</p>
                                                        }

                                                        {submissionSuccess && (
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                                <div className="flex items-center">
                                                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />


                                                                    <p className="text-green-800 font-medium">
                                                                        {
                                                                            submission?.id ? "Submission updated successfully!" : "Submission created successfully!"
                                                                        }
                                                                    </p>

                                                                </div>
                                                            </div>
                                                        )}


                                                        {
                                                            submission?.id ? (
                                                                <span className="text-zinc-400">You can update your submission until the Bounty&apos;s end date.</span>
                                                            ) : ""
                                                        }
                                                    </form>
                                                </>


                                            ) : (
                                                <>
                                                    <div className="flex flex-col justify-center items-center gap-5 text-center text-white bg-zinc-800 py-4 px-2 rounded-md">
                                                        <p>Please, connect a wallet to submit your participation!</p>
                                                        <WalletDropdown />
                                                    </div>
                                                </>
                                            )
                                        }
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {isAdmin && (
                                <TabsContent value="winners">
                                    <Card className="border-0 shadow-lg bg-zinc-800 backdrop-blur-sm py-8">
                                        <CardHeader>
                                            <div className="flex items-center space-x-2">
                                                <Crown className="w-5 h-5 text-[#F2C700]" />
                                                <CardTitle className="text-white">Select Winners</CardTitle>
                                            </div>
                                            <CardDescription className="text-zinc-400">Choose winners for this bounty and assign their positions</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="bg-zinc-900 rounded-lg p-4">
                                                <h4 className="font-semibold text-white mb-3">Prize Structure</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {bounty.prizes.map((prize, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 bg-zinc-800 rounded border border-zinc-700">
                                                            <span className="font-medium text-white">{prize.place} Place</span>
                                                            <span className="font-bold text-[#F2C700]">{Number.parseFloat(prize.prize.toString()).toLocaleString()} SSX</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-white">Submissions</h4>

                                                {
                                                    bounty?.submissions && bounty?.submissions.length > 0 ? (
                                                        bounty.submissions?.map((submission) => (
                                                            <Card key={submission.id} className="border border-zinc-700 bg-zinc-800">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between gap-10">
                                                                        <div className="flex-1">
                                                                            <span className="text-xs text-zinc-400 inline-block mb-2">Participant</span>
                                                                            <div className="flex items-center space-x-3 mb-2">
                                                                                <Link href={`https://x.com/${submission.twitter_handle}`} target="_blank" rel="noopener noreferrer" >
                                                                                    <h4 className="font-semibold text-white underline">{submission.twitter_handle}</h4>
                                                                                </Link>
                                                                                {selectedWinners[submission.id] && (
                                                                                    selectedWinners[submission.id] !== "No Prize" ? (
                                                                                        <Badge className="bg-[#fdc700] text-black">

                                                                                            {selectedWinners[submission.id]} Place
                                                                                        </Badge>

                                                                                    ) : ""
                                                                                )}
                                                                            </div>
                                                                            <ul className="mt-4 flex flex-col space-y-1 md:space-y-0 text-sm text-muted-foreground">
                                                                                <li>
                                                                                    <Link
                                                                                        href={submission.tweet_link}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="underline text-[#fdc700]"
                                                                                    >
                                                                                        Tweet link
                                                                                    </Link>
                                                                                </li>

                                                                                <li>
                                                                                    <p className="text-sm text-zinc-400 mt-5"><span className="font-semibold text-zinc-300">Wallet address:</span> {submission.wallet_address}</p>
                                                                                </li>
                                                                            </ul>
                                                                        </div>
                                                                        <div className="flex items-center space-x-3">
                                                                            <Select
                                                                                disabled={isSelectingWinners}
                                                                                value={selectedWinners[submission.id] || "No Prize"}
                                                                                onValueChange={(value) => handleWinnerSelection(submission.id, value)}
                                                                            >
                                                                                <SelectTrigger className="w-32 text-zinc-400 border-zinc-600">
                                                                                    <SelectValue placeholder="Select position" />
                                                                                </SelectTrigger>
                                                                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                                                                    {
                                                                                        bounty.prizes.map((prize, index) => (
                                                                                            <SelectItem key={index} value={prize.place} className="text-white hover:bg-zinc-700 focus:bg-zinc-700">{prize.place} Place</SelectItem>
                                                                                        ))
                                                                                    }
                                                                                    <SelectItem value="No Prize" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">No Prize</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>

                                                                    </div>
                                                                    {
                                                                        submission?.extra_info ? (
                                                                            <p className="text-sm text-muted-foreground mt-5"><span className="font-semibold text-white">Extra info:</span> {submission.extra_info}</p>
                                                                        ) : ""
                                                                    }
                                                                </CardContent>
                                                            </Card>
                                                        ))
                                                    ) : (
                                                        <p className="text-center text-white bg-zinc-800 py-4 px-2 rounded-md">There are no submissions yet.</p>
                                                    )
                                                }
                                            </div>

                                            <div className="pt-4 border-t">

                                                <Button
                                                    onClick={announceWinners}
                                                    className="bg-[#F2C700] hover:bg-[#F2C700]/90 text-black"
                                                    disabled={Object.keys(selectedWinners).length === 0 || isSelectingWinners || !isEnded(bounty.end_date)}
                                                >
                                                    <Trophy className="w-4 h-4 mr-2" />
                                                    {
                                                        isEnded(bounty.end_date) ? "Announce Winners" : "Bounty has not ended"
                                                    }
                                                </Button>
                                            </div>

                                            {
                                                isSelectingWinners ? (
                                                    <p className="text-white">Selecting winners...</p>
                                                ) : ""
                                            }

                                            {
                                                selectedWinnersSuccess ? (
                                                    <div className="flex justify-start items-center gap-4">
                                                        <Check />
                                                        <p className="text-green-500 font-semibold">Winners successfully selected!</p>
                                                    </div>
                                                ) : ""
                                            }

                                            {
                                                selectedWinnersError ? (
                                                    <div className="flex justify-start items-center gap-4">
                                                        <X />
                                                        <p className="text-red-500 font-semibold">Error selecting winners: {selectedWinnersError}</p>
                                                    </div>
                                                ) : ""
                                            }
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    )
}
