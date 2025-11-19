# SSX Bounties Platform

A modern, full-stack bounty management platform built with Next.js 15, Solana wallet integration, and Supabase. Users can participate in community challenges and earn $SSX tokens by contributing to various bounty categories.


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- Supabase account and project
- Solana wallet (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HosicoLabs/ssx-bounties-platform.git
   cd ssx-bounties-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   
   Set up the following tables in your Supabase project:
   
   - `categories` - Bounty categories
   - `bounties` - Main bounty data with prizes and requirements
   - `submissions` - User submissions for bounties
   - `admin-wallet-list` - Authorized admin wallet addresses

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── admin/         # Admin-only endpoints
│   │   ├── bounties/      # Bounty management
│   │   ├── categories/    # Category management
│   │   └── submissions/   # Submission handling
│   ├── admin/             # Admin dashboard
│   ├── bounties/          # Bounty pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── admin/             # Admin-specific components
│   ├── skeletons/         # Loading states
│   ├── solana/            # Solana wallet integration
│   └── ui/                # Base UI components (Radix UI)
├── lib/                   # Utility libraries
└── utils/                 # Helper functions and Supabase clients
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production with Turbopack
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint