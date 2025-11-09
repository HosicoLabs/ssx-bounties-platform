import { Submission } from "@/app/types";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { submission }: { submission: Submission } = await req.json();

        const supabase = await createClient();

        const { data, error } = await supabase.from("submissions").insert([
            {
                bounty_id: submission.bounty_id,
                wallet_address: submission.wallet_address,
                twitter_handle: submission.twitter_handle,
                tweet_link: submission.tweet_link,
                extra_info: submission.extra_info,
            }
        ])
            .select("*")
            .single();
        ;

        if (error) {
            console.error("Supabase error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({
            message: 'Submission stored successfully',
            submission: data ? data : null
        }), { status: 201 });
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}