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
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
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
      case "timeline":
        return (
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            Timeline
          </Badge>
        );
      case "roles":
        return (
          <Badge variant="secondary" className="gap-1">
            <Briefcase className="h-3 w-3" />
            Roles
          </Badge>
        );
      case "employees":
        return (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            Team Members
          </Badge>
        );
      case "general":
        return (
          <Badge variant="secondary" className="gap-1">
            <Briefcase className="h-3 w-3" />
            Multiple Changes
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || "Unknown";
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
          <div key={request.id}>
            {index > 0 && <Separator className="my-4" />}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{request.title}</h4>
                    {getTypeBadge(request.type)}
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Requested on {request.createdAt}
                  </p>
                </div>
                {canManage && request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => onApprove?.(request.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => onReject?.(request.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-sm">{request.description}</p>

              {/* Timeline Changes */}
              {request.changes?.timeline && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium">Timeline Changes:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date:</p>
                      <p>
                        <span className="line-through text-gray-400">
                          {request.changes.timeline.oldStartDate}
                        </span>{" "}
                        → <span className="font-medium">{request.changes.timeline.newStartDate}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date:</p>
                      <p>
                        <span className="line-through text-gray-400">
                          {request.changes.timeline.oldEndDate}
                        </span>{" "}
                        → <span className="font-medium">{request.changes.timeline.newEndDate}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration:</p>
                      <p>
                        <span className="line-through text-gray-400">
                          {request.changes.timeline.oldDuration} weeks
                        </span>{" "}
                        → <span className="font-medium">{request.changes.timeline.newDuration} weeks</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Role Changes */}
              {request.changes?.roles && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium">Role Changes:</p>
                  {request.changes.roles.added && request.changes.roles.added.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Added Roles:</p>
                      <ul className="list-disc list-inside text-sm">
                        {request.changes.roles.added.map((role, idx) => (
                          <li key={idx}>
                            {role.role} ({role.seniority}) × {role.count}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {request.changes.roles.removed && request.changes.roles.removed.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Removed Roles:</p>
                      <ul className="list-disc list-inside text-sm">
                        {request.changes.roles.removed.map((role, idx) => (
                          <li key={idx}>
                            {role.role} ({role.seniority}) × {role.count}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {request.changes.roles.modified && request.changes.roles.modified.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Modified Roles:</p>
                      <ul className="list-disc list-inside text-sm">
                        {request.changes.roles.modified.map((role, idx) => (
                          <li key={idx}>
                            {role.role} ({role.seniority}): {role.oldCount} → {role.newCount}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Employee Changes */}
              {request.changes?.employees && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <p className="text-sm font-medium">Team Member Changes:</p>
                  {request.changes.employees.added && request.changes.employees.added.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Added Members:</p>
                      <ul className="list-disc list-inside text-sm">
                        {request.changes.employees.added.map((emp, idx) => (
                          <li key={idx}>
                            {getEmployeeName(emp.employeeId)} - {emp.role} ({emp.seniority})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {request.changes.employees.removed && request.changes.employees.removed.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Removed Members:</p>
                      <ul className="list-disc list-inside text-sm">
                        {request.changes.employees.removed.map((emp, idx) => (
                          <li key={idx}>
                            {getEmployeeName(emp.employeeId)} - {emp.role} ({emp.seniority})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


