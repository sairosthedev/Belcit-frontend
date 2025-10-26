"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, User, Shield, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

interface MandatoryCheckoutModalProps {
  user: any;
  onCheckOut: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function MandatoryCheckoutModal({ user, onCheckOut, onCancel, isOpen }: MandatoryCheckoutModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      console.log('Modal: Calling onCheckOut callback...');
      await onCheckOut(); // Call the prop function from auth context
      toast({
        title: "Checked Out Successfully",
        description: "Your work session has been recorded and you have been logged out",
      });
    } catch (error: any) {
      console.error('Modal: Check-out failed:', error);
      toast({
        title: "Check-out Failed",
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
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <LogOut className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Mandatory Check-Out Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Attendance Policy</strong>
              <p className="mt-2 text-sm">
                You must check out before logging out. 
                This ensures accurate time tracking and proper session closure.
              </p>
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium capitalize">{user?.role}</span>
            </p>
            <p className="text-sm text-gray-600">
              Time: <span className="font-medium">{new Date().toLocaleString()}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCheckOut} 
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              {loading ? "Checking Out..." : "Check Out & Logout"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You cannot logout without checking out first
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
