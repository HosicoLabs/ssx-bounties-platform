import { Bounty } from "@/app/types";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { bounty }: { bounty: Bounty } = await req.json();

        const supabase = await createClient();

        const { data, error } = await supabase.from("bounties").insert([
            {
                title: bounty.title,
                description: bounty.description,
                requirements: bounty.requirements,
                end_date: bounty.end_date,
                category: bounty.category,
                prizes: bounty.prizes,
            }
        ]);

        if (error) {
            console.error("Supabase error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({
            message: 'Bounty created successfully',
            bounty: data ? data[0] : null
        }), { status: 201 });
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}