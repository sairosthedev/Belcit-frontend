"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked?: number;
  overtime?: number;
  status: string;
  notes?: string;
  staff?: {
    _id: string;
    firstName: string;
    lastName: string;
    username?: string;
  };
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  loading?: boolean;
  isAdmin?: boolean;
}

export function AttendanceTable({ records, loading, isAdmin = false }: AttendanceTableProps) {
  console.log('AttendanceTable render - records:', records, 'loading:', loading, 'isAdmin:', isAdmin);
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      "half-day": "secondary",
      leave: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAdmin ? "Attendance Audit Trail" : "My Attendance History"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isAdmin 
            ? "Complete log of all staff check-ins and check-outs"
            : "Your personal attendance records"
          }
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading attendance...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attendance records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {isAdmin && <TableHead>Staff Member</TableHead>}
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        {record.staff ? 
                          `${record.staff.firstName} ${record.staff.lastName}` : 
                          'Unknown Staff'
                        }
                      </TableCell>
                    )}
                    <TableCell>{new Date(record.checkIn).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "-"}
                    </TableCell>
                    <TableCell>{record.hoursWorked ? `${record.hoursWorked}h` : "-"}</TableCell>
                    <TableCell>{record.overtime ? `${record.overtime}h` : "-"}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
