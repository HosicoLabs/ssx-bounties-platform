import { useEffect, useState } from "react"
import { useSolana } from "../solana/use-solana"

export function useAdmin() {
    const [isLoading, setIsLoading] = useState(true)
    const [adminWalletList, setAdminWalletList] = useState<string[]>([])
    const { connected, wallet } = useSolana()

    const isAdmin = connected && wallet && adminWalletList.includes(wallet.accounts[0].address)

    const fetchAdminWalletList = async () => {
        try {
            const data = await (await fetch("/api/admin/wallet-list")).json()
            setAdminWalletList(data.walletList)
        } catch (err) {
            console.error("Failed to fetch admin wallet list", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAdminWalletList()
    }, [])
    return {
        isLoading,
        adminWalletList,
        isAdmin
    }
}
