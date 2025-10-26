"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Timer } from "lucide-react";

interface LiveTimerProps {
  checkInTime?: string;
  isCheckedIn: boolean;
}

export function LiveTimer({ checkInTime, isCheckedIn }: LiveTimerProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isCheckedIn && checkInTime && isClient) {
      const timer = setInterval(() => {
        const now = new Date();
        const checkIn = new Date(checkInTime);
        const diff = now.getTime() - checkIn.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCheckedIn, checkInTime, isClient]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isClient && currentTime ? currentTime.toLocaleTimeString() : "--:--:--"}
          </div>
          <p className="text-xs text-muted-foreground">
            {isClient && currentTime ? currentTime.toLocaleDateString() : "Loading..."}
          </p>
        </CardContent>
      </Card>

      {isCheckedIn && checkInTime && isClient && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Worked</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {elapsedTime}
            </div>
            <p className="text-xs text-muted-foreground">
              Since {isClient ? new Date(checkInTime).toLocaleTimeString() : "Loading..."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
