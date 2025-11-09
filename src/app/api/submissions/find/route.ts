import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Payload = {
  bounty_id: number;
  wallet_address: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Payload>;
    const bounty_id = Number(body?.bounty_id);
    const wallet_address = (body?.wallet_address ?? "").trim();

    if (!Number.isFinite(bounty_id) || bounty_id <= 0 || !wallet_address) {
      return new Response(
        JSON.stringify({ error: "bounty_id (number) and wallet_address (string) are required" }),
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("bounty_id", bounty_id)
      .eq("wallet_address", wallet_address)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        submission: data ?? {},
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
