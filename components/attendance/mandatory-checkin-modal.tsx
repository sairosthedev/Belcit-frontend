"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

interface MandatoryCheckinModalProps {
  user: any;
  onCheckIn: () => void;
  isOpen: boolean;
}

export function MandatoryCheckinModal({ user, onCheckIn, isOpen }: MandatoryCheckinModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  console.log('MandatoryCheckinModal render - isOpen:', isOpen, 'user:', user?.firstName);

  useEffect(() => {
    console.log('Modal isOpen changed to:', isOpen);
  }, [isOpen]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      console.log('Modal: Calling onCheckIn callback...');
      await onCheckIn();
      
      toast({
        title: "Checked In Successfully",
        description: "You can now access the system",
      });
    } catch (error: any) {
      console.error('Modal: Check-in failed:', error);
      toast({
        title: "Check-in Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Mandatory Check-In Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Attendance Policy</strong>
              <p className="mt-2 text-sm">
                You must check in before accessing any system features. 
                This ensures accurate time tracking and system security.
              </p>
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Welcome, {user?.firstName} {user?.lastName}</span>
            </div>
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium capitalize">{user?.role}</span>
            </p>
            <p className="text-sm text-gray-600">
              Time: <span className="font-medium">{new Date().toLocaleString()}</span>
            </p>
          </div>

          <Button 
            onClick={handleCheckIn} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Checking In..." : "Check In to Continue"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You cannot access the system until you check in
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
