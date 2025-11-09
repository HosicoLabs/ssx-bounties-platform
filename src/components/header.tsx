'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletDropdown } from "./wallet-dropdown"
import Image from "next/image"
import { useAdmin } from "./admin/use-admin"
import { Button } from "./ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"
import { Menu } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { isAdmin } = useAdmin()

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/bounties", label: "All bounties" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : [])
  ]

  return (
    <header className="border-b bg-black/80 backdrop-blur-sm sticky top-0 z-50 border-none">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image width={60} height={60} src="/images/ssx-logo.jpg" alt="SSX" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-[#F2C700] truncate">SSX Bounties</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">SSX Community Platform</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors duration-200 hover:text-[#F2C700] whitespace-nowrap ${
                pathname === item.href ? "text-[#F2C700] font-bold" : "text-[#fff]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navigationItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={`w-full ${
                        pathname === item.href ? "text-[#F2C700] font-bold" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <WalletDropdown />
        </div>
      </div>
    </header>
  )
}
