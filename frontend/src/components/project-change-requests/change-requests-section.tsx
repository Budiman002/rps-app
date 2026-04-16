import { useState } from "react";
import { formatDate, formatDateTime } from "@/functions/dateFormatter";
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

  const getTypeBadge = (request: ChangeRequest) => {
    const badges = [];

    // Check if timeline changes were included
    if (request.NewStartDate || request.NewEndDate || request.NewDurationWeeks) {
      badges.push(<Badge key="Timeline" variant="secondary" className="gap-1"><Calendar className="h-3 w-3" />Timeline</Badge>);
    }
    
    // Check if role changes were included
    if (request.RoleChangesJson) {
      badges.push(<Badge key="Roles" variant="secondary" className="gap-1"><Briefcase className="h-3 w-3" />Roles</Badge>);
    }
    
    // Check if member changes were included
    if (request.MemberChangesJson) {
      badges.push(<Badge key="Team Members" variant="secondary" className="gap-1"><Users className="h-3 w-3" />Team Members</Badge>);
    }

    // Fallback just in case
    if (badges.length === 0 && request.RequestType) {
      badges.push(<Badge key={request.RequestType} variant="secondary">{request.RequestType}</Badge>);
    }

    return (
      <div className="flex gap-1 flex-wrap">
        {badges}
      </div>
    );
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.Id === employeeId)?.FullName || "Unknown";
  };


  const [activeFilters, setActiveFilters] = useState<string[]>(["Pending"]);

  const toggleFilter = (status: string) => {
    setActiveFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const sortedRequests = [...requests].sort((a, b) => {
    return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
  });

  const filteredRequests = sortedRequests.filter(req => {
    if (activeFilters.length === 0) return false;
    return activeFilters.includes(req.Status);
  });

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Change Requests</CardTitle>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-md">
            <Button
              variant={activeFilters.includes("Pending") ? "default" : "ghost"}
              size="sm"
              onClick={() => toggleFilter("Pending")}
              className="text-xs h-8"
            >
              Pending
            </Button>
            <Button
              variant={activeFilters.includes("Approved") ? "default" : "ghost"}
              size="sm"
              onClick={() => toggleFilter("Approved")}
              className="text-xs h-8"
              style={activeFilters.includes("Approved") ? { backgroundColor: "#10b981" } : {}}
            >
              Approved
            </Button>
            <Button
              variant={activeFilters.includes("Rejected") ? "default" : "ghost"}
              size="sm"
              onClick={() => toggleFilter("Rejected")}
              className="text-xs h-8"
              style={activeFilters.includes("Rejected") ? { backgroundColor: "#ef4444" } : {}}
            >
              Rejected
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            No requests found for selected filters.
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.Id} className="border-2 border-slate-200 rounded-lg p-5 space-y-4 shadow-sm bg-white mb-4 last:mb-0">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 w-full">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h4 
                      className="font-medium break-all min-w-0"
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {request.ChangeTitle}
                    </h4>
                    {getTypeBadge(request)}
                    {getStatusBadge(request.Status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Requested on {formatDateTime(request.CreatedAt, "Asia/Jakarta")} (WIB)
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

              <p 
                className="text-sm break-all min-w-0"
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                {request.ChangeDescription}
              </p>

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
                                    {role.role} ({role.seniority}) {role.allocationType ? `- ${role.allocationType === "parallel" ? "Parallel" : "Dedicated"} ` : ""}× {role.count}
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
                                    {role.role} ({role.seniority}) {role.allocationType ? `- ${role.allocationType === "parallel" ? "Parallel" : "Dedicated"} ` : ""}× {role.count}
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
        )))}
      </CardContent>
    </Card>
  );
}


