import { Submission } from "@/app/types";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request) {
    try {
        const { submission, submissionId }: { submissionId: number, submission: Submission } = await req.json();

        const supabase = await createClient();

        const { data, error } = await supabase.from("submissions").update([
            {
                twitter_handle: submission.twitter_handle,
                tweet_link: submission.tweet_link,
                extra_info: submission.extra_info,
            }
        ])
            .eq("id", submissionId)
            .eq("bounty_id", submission.bounty_id)
            .eq("wallet_address", submission.wallet_address)
            .select("*")
            .single();
        ;

        if (error) {
            console.error("Supabase error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        if (!data) {
            return new Response(JSON.stringify({ error: "Submission not found" }), { status: 404 });
        }

        return new Response(
            JSON.stringify({
                message: "Submission updated successfully",
                submission: data ? data : null,
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}