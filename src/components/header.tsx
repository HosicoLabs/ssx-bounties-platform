'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletDropdown } from "./wallet-dropdown"
import Image from "next/image"
import { useAdmin } from "./admin/use-admin"

export function Header() {
  const pathname = usePathname()
  const { isAdmin } = useAdmin()

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image width={40} height={40} src="/images/hosico-portrait.png" alt="Hosico" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1c398e]">Hosico Bounties</h1>
            <p className="text-sm text-muted-foreground">Hosico Community Platform</p>
          </div>
        </div>


        <ul className="flex justify-end items-center gap-4 flex-wrap">

          <li>
            <Link
              href="/"
              className={`transition-colors duration-200 hover:text-[#ff6900] ${pathname === "/" ? "text-[#ff6900] font-bold" : "text-[#1c398e]"
                }`}
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              href="/bounties"
              className={`transition-colors duration-200 hover:text-[#ff6900] ${pathname === "/bounties" ? "text-[#ff6900] font-bold" : "text-[#1c398e]"
                }`}
            >
              All bounties
            </Link>
          </li>

          {
            isAdmin ? (
              <li>
                <Link
                  href="/admin"
                  className={`transition-colors duration-200 hover:text-[#ff6900] ${pathname === "/admin" ? "text-[#ff6900] font-bold" : "text-[#1c398e]"
                    }`}
                >
                  Admin
                </Link>
              </li>
            ) : ""
          }

        </ul>

        <div className="hidden md:flex items-center gap-4">
          <WalletDropdown />
        </div>
      </div>
    </header>
  )
}
