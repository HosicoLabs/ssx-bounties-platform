import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request) {
    try {
        const { bountyId, winners }: { bountyId: number, winners: { [key: number]: string } } = await req.json();

        const supabase = await createClient();

        const { data: bounty, error: bountyError } = await supabase.from("bounties").select("winners").eq("id", bountyId).single();

        if (bounty && bounty.winners) {
            return new Response(JSON.stringify({ error: "The winners have already been selected!" }), { status: 400 });
        }

        if (bountyError) {
            console.error("Supabase error:", bountyError);
            return new Response(JSON.stringify({ error: bountyError.message }), { status: 500 });
        }

        const { data, error } = await supabase.from("bounties").update([
            {
                winners: JSON.stringify(winners),
            }
        ])
            .eq("id", bountyId)
            .select("*")
            .single();
        ;

        if (error) {
            console.error("Supabase error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(
            JSON.stringify({
                message: "Bounty updated successfully",
                bounty: data ? data : null,
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}