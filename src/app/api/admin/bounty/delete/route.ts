import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { bountyId }: { bountyId: number } = await req.json();
    
    const idNum = Number(bountyId);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      return new Response(JSON.stringify({ error: "Invalid bounty id" }), { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bounties")
      .delete()
      .eq("id", idNum)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "Bounty not found" }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: "Bounty deleted successfully", bounty: data }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
