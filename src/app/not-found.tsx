import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="space-y-6">
            <div className="mx-auto w-24 h-24 flex items-center justify-center bg-muted rounded-full">
              <span className="text-4xl font-bold text-muted-foreground">404</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Page Not Found
              </h1>
              <p className="text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/" className="w-full">
                <Button className="w-full">
                  Back to Home
                </Button>
              </Link>
              
              <Link href="/bounties" className="w-full">
                <Button variant="outline" className="w-full">
                  View Bounties
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}