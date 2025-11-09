import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("bounties")
            .select(`
                *,
                category:categories(*),
                submissions:submissions(count)
            `)
            .limit(1, { foreignTable: "submissions" })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        const bounties = (data ?? []).map((b) => ({
            ...b,
            submissions_total: b?.submissions?.[0]?.count ?? 0,
        }));

        return new Response(JSON.stringify({
            bounties
        }), { status: 200 });
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}