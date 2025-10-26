"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { AttendanceHeader } from "@/components/attendance/attendance-header";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { LiveTimer } from "@/components/attendance/live-timer";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function AttendancePage() {
  const { user, isCheckedIn, currentCheckInTime, handleCheckIn, handleCheckOut } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  
  // Check user role
  const isAdmin = user?.role === "admin" || user?.role === "superAdmin";

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      console.log('Fetching attendance for user:', user?._id, 'isAdmin:', isAdmin);
      let data;
      
      if (isAdmin) {
        // Admins see ALL attendance records (audit trail)
        data = await apiFetch('/api/attendance');
      } else {
        // Regular users see only their own attendance using the simple endpoint
        data = await apiFetch('/api/attendance/my-attendance-simple');
      }
      
      console.log('Attendance data received:', data);
      console.log('Attendance records count:', data.attendance?.length || 0);
      console.log('First few records:', data.attendance?.slice(0, 3));
      setRecords(data.attendance || []);
      
      // Note: Check-in status is managed globally by auth context
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch attendance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAttendance();
    }
  }, [user]);

  const handleCheckInClick = async () => {
    setCheckLoading(true);
    try {
      console.log('Attendance page: Calling handleCheckIn from auth context');
      await handleCheckIn();
      console.log('Attendance page: Check-in successful, refreshing attendance data');
      toast({
        title: "Success",
        description: "Checked in successfully",
      });
      fetchAttendance();
    } catch (error: any) {
      console.error('Attendance page: Check-in failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check in",
        variant: "destructive",
      });
    } finally {
      setCheckLoading(false);
    }
  };

  const handleCheckOutClick = async () => {
    setCheckLoading(true);
    try {
      console.log('Attendance page: Calling handleCheckOut from auth context');
      await handleCheckOut();
      console.log('Attendance page: Check-out successful, refreshing attendance data');
      toast({
        title: "Success",
        description: "Checked out successfully",
      });
      fetchAttendance();
    } catch (error: any) {
      console.error('Attendance page: Check-out failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check out",
        variant: "destructive",
      });
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Attendance Audit Trail" : "My Attendance"}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Monitor all staff check-ins and check-outs across the organization"
            : "View your personal attendance history and check in/out"
          }
        </p>
      </div>
      <LiveTimer 
        checkInTime={currentCheckInTime} 
        isCheckedIn={isCheckedIn} 
      />
      <AttendanceHeader
        onCheckIn={handleCheckInClick}
        onCheckOut={handleCheckOutClick}
        isCheckedIn={isCheckedIn}
        loading={checkLoading}
      />
      <AttendanceTable records={records} loading={loading} isAdmin={isAdmin} />
    </div>
  );
}
