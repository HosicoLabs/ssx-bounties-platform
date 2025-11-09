import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from("admin-wallet-list").select("wallet_address");

        if (error) {
            console.error("Supabase error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        const walletAddressList = data?.map(wallet => wallet.wallet_address) || [];

        return new Response(JSON.stringify({
            walletList: walletAddressList
        }), { status: 200 });
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}