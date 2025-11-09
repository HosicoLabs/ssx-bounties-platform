"use client";

import { useState } from "react";
import { Bounty } from "@/app/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Coins, Users } from "lucide-react";
import { calculateTotalPrize, isEnded } from "@/utils/bounties";
import { formatEndDate } from "@/utils/date";
import { Button } from "./ui/button";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useBounties } from "./bounties-provider";
import { cn } from "@/lib/utils";

type Props = {
    bounty: Bounty;
    isAdmin?: boolean;
};

export function BountyCard({ bounty, isAdmin = false }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { refreshBounties } = useBounties()

    const deleteBounty = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch("/api/admin/bounty/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ bountyId: bounty.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete bounty");
            }

            await refreshBounties();
            setIsOpen(false);
        } catch (error) {
            console.error("Error deleting bounty:", error);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Card
            key={bounty?.id}
            className="border-0 shadow-lg bg-zinc-900 py-8 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 justify-between"
        >
            <CardHeader>
                <div className="flex items-start justify-start gap-2 mb-2">
                    <Badge variant="outline" className="border-zinc-600 text-zinc-300 bg-zinc-900/50">
                        {bounty?.category?.name}
                    </Badge>
                    <Badge variant="outline" className={cn(isEnded(bounty?.end_date) ? "border-zinc-600 text-zinc-300 bg-zinc-900/50" : "bg-[#F2C700] text-black border-[#F2C700]")}>
                        {isEnded(bounty?.end_date) ? "Finalized" : "Active"}
                    </Badge>
                </div>
                <CardTitle className="text-white text-2xl">{bounty?.title}</CardTitle>
                <CardDescription className="text-zinc-400">{bounty?.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 self-end">
                    <div className="flex flex-col justify-center items-start gap-2">
                        {bounty?.prizes.map((prize, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <span className="font-medium text-zinc-300">{prize.place}:</span>
                                <span className="font-bold text-[#F2C700]">
                                    {Number.parseFloat(prize.prize.toString()).toLocaleString()} SSX
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2 mb-8">
                        <Coins className="w-4 h-4 text-[#F2C700]" />
                        <span className="font-medium text-zinc-300">Total Prize:</span>
                        <span className="font-bold text-[#F2C700]">
                            {calculateTotalPrize(bounty?.prizes)} SSX
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 justify-start">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-zinc-400">
                            End date: {formatEndDate(bounty?.end_date)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 mt-10">
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm text-zinc-400">{bounty?.submissions_total} Submissions</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            {isAdmin ? (
                                <AlertDialog
                                    open={isOpen}
                                    onOpenChange={(next) => {
                                        if (isDeleting) return;
                                        setIsOpen(next);
                                    }}
                                >
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:flex-1"
                                            disabled={isDeleting}
                                            onClick={() => setIsOpen(true)}
                                        >
                                            {isDeleting ? "Deleting…" : "Delete"}
                                        </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent className="bg-zinc-900 border-none">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Bounty</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete &quot;{bounty.title}&quot;? This action cannot be undone and
                                                will remove all submissions associated with this bounty.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-zinc-800 border-none" disabled={isDeleting}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-600 hover:bg-red-700"
                                                disabled={isDeleting}
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    await deleteBounty();
                                                }}
                                            >
                                                {isDeleting ? "Deleting…" : "Delete Bounty"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : null}

                            <Link href={`/bounties/${bounty?.id}`} className="w-full sm:flex-1">
                                <Button size="sm" className="bg-[#F2C700] hover:bg-[#F2C700]/90 text-black w-full">
                                    {isEnded(bounty?.end_date) ? "View Results" : (isAdmin ? "View Bounty" : "Join Bounty")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
