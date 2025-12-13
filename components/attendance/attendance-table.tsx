"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      "half-day": "outline",
      leave: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"} className="font-semibold">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Clock className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {isAdmin ? "Attendance Audit Trail" : "My Attendance History"}
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium">
            {isAdmin
              ? "Complete log of all staff check-ins and check-outs"
              : "Your personal attendance records"
            }
          </p>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-lg font-semibold text-muted-foreground">No attendance records found</p>
              <p className="text-sm text-muted-foreground mt-1">Records will appear here as attendance is tracked</p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">Date</TableHead>
                    {isAdmin && <TableHead className="font-bold">Staff Member</TableHead>}
                    <TableHead className="font-bold">Check In</TableHead>
                    <TableHead className="font-bold">Check Out</TableHead>
                    <TableHead className="font-bold">Hours Worked</TableHead>
                    <TableHead className="font-bold">Overtime</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {records.map((record, idx) => (
                      <motion.tr
                        key={record._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {record.staff ?
                                  `${record.staff.firstName} ${record.staff.lastName}` :
                                  'Unknown Staff'
                                }
                              </span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="text-green-600 font-semibold">
                          {new Date(record.checkIn).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="text-orange-600 font-semibold">
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "-"}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {record.hoursWorked ? `${record.hoursWorked}h` : "-"}
                        </TableCell>
                        <TableCell className={record.overtime && record.overtime > 0 ? "font-bold text-amber-600" : ""}>
                          {record.overtime ? `${record.overtime}h` : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
