import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Submission } from "@/app/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      return new Response(JSON.stringify({ error: "Invalid id" }), { status: 400 });
    }

    const supabase = await createClient();

    const { data: bounty, error } = await supabase
      .from("bounties")
      .select(`
        *,
        category:categories(*),
        submissions:submissions(*)
      `)
      .eq("id", idNum)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!bounty) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    const winnersObj = JSON.parse(bounty.winners)

    let winnersArray: Array<{ position: number; submission: Submission, position_number: number }> | null = null;

    if (winnersObj && Object.keys(winnersObj).length > 0) {
      const winnerIds = Object.keys(winnersObj)
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n));

      if (winnerIds.length > 0) {
        const { data: winnerSubs, error: winnersError } = await supabase
          .from("submissions")
          .select("*")
          .in("id", winnerIds);

        if (winnersError) {
          console.error("Supabase winners fetch error:", winnersError);
          return new Response(JSON.stringify({ error: winnersError.message }), { status: 500 });
        }

        winnersArray = winnerSubs?.map((sub) => {
          return {
            submission: sub,
            position: winnersObj[sub.id],
            position_number: Number(winnersObj[sub.id][0])
          }
        }).sort((a, b) => a.position_number - b.position_number);
      } else {
        winnersArray = [];
      }
    } else {
      winnersArray = null;
    }

    const bountyWithWinners = {
      ...bounty,
      winners: winnersArray,
    };

    return new Response(JSON.stringify({ bounty: bountyWithWinners }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
