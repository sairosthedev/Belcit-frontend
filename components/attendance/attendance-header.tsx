"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AttendanceHeaderProps {
  onCheckIn: () => void;
  onCheckOut: () => void;
  isCheckedIn: boolean;
  loading?: boolean;
}

export function AttendanceHeader({ onCheckIn, onCheckOut, isCheckedIn, loading }: AttendanceHeaderProps) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance Tracking</h2>
          <p className="text-muted-foreground">
            {isCheckedIn ? "You are currently checked in" : "Check in to start tracking your hours"}
          </p>
        </div>
        <div className="flex gap-2">
          {!isCheckedIn ? (
            <Button onClick={onCheckIn} disabled={loading} size="lg">
              Check In
            </Button>
          ) : (
            <Button onClick={onCheckOut} disabled={loading} size="lg" variant="destructive">
              Check Out
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}


