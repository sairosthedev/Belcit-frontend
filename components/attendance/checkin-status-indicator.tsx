"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface CheckinStatusIndicatorProps {
  isCheckedIn: boolean;
}

export function CheckinStatusIndicator({ isCheckedIn }: CheckinStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {isCheckedIn ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <Badge variant="default" className="bg-green-100 text-green-800">
            Checked In
          </Badge>
        </>
      ) : (
        <>
          <Clock className="w-4 h-4 text-orange-600" />
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Not Checked In
          </Badge>
        </>
      )}
    </div>
  );
}

