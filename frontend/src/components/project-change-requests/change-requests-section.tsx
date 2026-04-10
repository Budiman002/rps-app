import { ChangeRequest, Employee } from "@/contexts/data-context";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { CheckCircle2, XCircle, Clock, Calendar, Users, Briefcase } from "lucide-react";

interface ChangeRequestsSectionProps {
  requests: ChangeRequest[];
  employees: Employee[];
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  canManage?: boolean;
}

export function ChangeRequestsSection({
  requests,
  employees,
  onApprove,
  onReject,
  canManage = false,
}: ChangeRequestsSectionProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge className="bg-emerald-500 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Timeline":
        return (
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            Timeline
          </Badge>
        );
      case "Roles":
        return (
          <Badge variant="secondary" className="gap-1">
            <Briefcase className="h-3 w-3" />
            Roles
          </Badge>
        );
      case "Team":
        return (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            Team Members
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.Id === employeeId)?.FullName || "Unknown";
  };

  const formatDate = (value: string) => {
    if (!value) return "-";
    const parts = value.split("T");
    const dateOnly = parts[0];
    if (!dateOnly) return "-";
    const [year, month, day] = dateOnly.split("-").map(Number);
    if (year === undefined || month === undefined || day === undefined || isNaN(year) || isNaN(month) || isNaN(day)) return value;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No change requests yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request, index) => (
          <div key={request.Id}>
            {index > 0 && <Separator className="my-4" />}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{request.ChangeTitle}</h4>
                    {getTypeBadge(request.RequestType)}
                    {getStatusBadge(request.Status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Requested on {formatDate(request.CreatedAt)}
                  </p>
                </div>
                {canManage && request.Status === "Pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => onApprove?.(request.Id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => onReject?.(request.Id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-sm">{request.ChangeDescription}</p>

              {/* Timeline Changes */}
              {request.NewStartDate && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium">Timeline Changes:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">New Start Date:</p>
                      <p className="font-medium">{formatDate(request.NewStartDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">New End Date:</p>
                      <p className="font-medium">{formatDate(request.NewEndDate || "")}</p>
                    </div>
                    {request.NewDurationWeeks && (
                      <div>
                        <p className="text-gray-500">New Duration:</p>
                        <p className="font-medium">{request.NewDurationWeeks} weeks</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Role Changes (Parsed from JSON) */}
              {request.RoleChangesJson && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium">Role Changes:</p>
                  {(() => {
                    try {
                      const roles = JSON.parse(request.RoleChangesJson);
                      return (
                        <>
                          {roles.added?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Added Roles:</p>
                              <ul className="list-disc list-inside text-sm">
                                {roles.added.map((role: any, idx: number) => (
                                  <li key={idx}>
                                    {role.role} ({role.seniority}) × {role.count}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {roles.removed?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Removed Roles:</p>
                              <ul className="list-disc list-inside text-sm">
                                {roles.removed.map((role: any, idx: number) => (
                                  <li key={idx}>
                                    {role.role} ({role.seniority}) × {role.count}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      );
                    } catch (e) {
                      return <p className="text-xs text-red-500 italic">Error parsing role changes</p>;
                    }
                  })()}
                </div>
              )}

              {/* Team Member Changes (Parsed from JSON) */}
              {request.MemberChangesJson && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium">Team Member Changes:</p>
                  {(() => {
                    try {
                      const members = JSON.parse(request.MemberChangesJson);
                      return (
                        <>
                          {members.added?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Added Members:</p>
                              <ul className="list-disc list-inside text-sm">
                                {members.added.map((emp: any, idx: number) => (
                                  <li key={idx}>
                                    {getEmployeeName(emp.employeeId)} - {emp.role} ({emp.seniority})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {members.removed?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Removed Members:</p>
                              <ul className="list-disc list-inside text-sm">
                                {members.removed.map((emp: any, idx: number) => (
                                  <li key={idx}>
                                    {getEmployeeName(emp.employeeId)} - {emp.role} ({emp.seniority})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      );
                    } catch (e) {
                      return <p className="text-xs text-red-500 italic">Error parsing team changes</p>;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


