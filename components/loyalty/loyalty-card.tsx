"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Star, TrendingUp } from "lucide-react";

interface CustomerLoyalty {
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
}

interface LoyaltyCardProps {
  loyalty: CustomerLoyalty;
}

export function LoyaltyCard({ loyalty }: LoyaltyCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loyalty.loyaltyPoints || 0}</div>
          <p className="text-xs text-muted-foreground">
            Ready to redeem
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${loyalty.totalSpent?.toFixed(2) || "0.00"}</div>
          <p className="text-xs text-muted-foreground">
            Lifetime spending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visit Count</CardTitle>
          <Gift className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loyalty.visitCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            {loyalty.lastVisit ? `Last visit: ${new Date(loyalty.lastVisit).toLocaleDateString()}` : "No visits yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
