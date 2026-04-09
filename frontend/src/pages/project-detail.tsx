import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, FileEdit, Calendar, Users, Building2, Flag, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RequestChangeModal } from "@/components/project-change-requests/request-change-modal";
import { ChangeRequestsSection } from "@/components/project-change-requests/change-requests-section";
import { toast } from "sonner";

export function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { projects, employees, addDetailedRequestChange, approveChangeRequest, rejectChangeRequest } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const project = projects.find(p => p.id === id);

  // Get the return path from location state, or use a default based on user role
  const getBackPath = () => {
    if (location.state?.from) {
      return location.state.from;
    }
    // Default fallback based on user role
    if (user?.role === "pm") {
      return "/app/pm-dashboard";
    }
    return "/app/projects";
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <Button onClick={() => navigate(getBackPath())}>Back</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-purple-500">Scheduled</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "unassigned":
        return <Badge variant="secondary">Unassigned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-500">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getEmployeeDetails = (employeeId: string) => {
    return employees.find(e => e.id === employeeId);
  };

  // Check if current user is the PM of this project
  const pmEmployee = employees.find(e => e.email === user?.email);
  const isPM = user?.role === "pm" && project.pmId === pmEmployee?.id;

  useEffect(() => {
    if (isPM && location.state?.openRequestModal) {
      setShowRequestModal(true);
      navigate(location.pathname, {
        replace: true,
        state: { from: location.state?.from },
      });
    }
  }, [isPM, location.pathname, location.state, navigate]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => navigate(getBackPath())}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-500 mt-1">Project Details</p>
          </div>
          <div className="flex gap-2">
            {isPM && (
              <Button
                onClick={() => setShowRequestModal(true)}
                className="gap-2"
              >
                <FileEdit className="h-4 w-4" />
                Request Changes
              </Button>
            )}
            {user?.role === "gm" && (
              <Button
                onClick={() => navigate(`/app/projects/${project.id}/edit`, { state: { from: location.state?.from } })}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Project
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Client</div>
                <div className="font-medium">{project.clientName}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Flag className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Priority</div>
                <div className="font-medium">{getPriorityBadge(project.priority)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium">
                  {project.startDate || project.expectedStartDate || "Not set"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">End Date</div>
                <div className="font-medium">
                  {project.endDate || project.estimatedEndDate || "Not set"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-medium">{project.duration} weeks</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 flex items-center justify-center text-gray-400 mt-0.5">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">{getStatusBadge(project.status)}</div>
              </div>
            </div>
          </div>

          {project.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
            </>
          )}

          {project.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes from Marketing</h3>
                <p className="text-gray-600">{project.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Members Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>
                {project.assignedMembers?.length || 0} / {project.teamComposition.reduce((sum, t) => sum + t.count, 0)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {project.assignedMembers && project.assignedMembers.length > 0 ? (
            <div className="space-y-4">
              {project.assignedMembers.map((member) => {
                const employee = getEmployeeDetails(member.employeeId);
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {employee ? getInitials(employee.name) : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{employee?.email || ""}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{member.role}</div>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {member.seniority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No team members assigned yet</p>
              {user?.role === "gm" && project.status === "unassigned" && (
                <Button
                  className="mt-4"
                  onClick={() => navigate(`/app/projects/${project.id}/assign`)}
                >
                  Assign Team Members
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Required Roles Card */}
      <Card>
        <CardHeader>
          <CardTitle>Required Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.teamComposition.map((comp, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-medium">{comp.role}</div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="capitalize">
                    {comp.seniority}
                  </Badge>
                  <span className="text-sm text-gray-500">×{comp.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change Requests (if any) */}
      {project.requestChanges && project.requestChanges.length > 0 && (user?.role === "gm" || isPM) && (
        <ChangeRequestsSection
          requests={project.requestChanges}
          employees={employees}
          onApprove={(requestId) => {
            approveChangeRequest(project.id, requestId);
            toast.success("Change request approved");
          }}
          onReject={(requestId) => {
            rejectChangeRequest(project.id, requestId);
            toast.error("Change request rejected");
          }}
          canManage={user?.role === "gm"}
        />
      )}

      {/* Request Change Modal */}
      {isPM && (
        <RequestChangeModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          project={project}
          employees={employees}
          onSubmit={(changeRequest) => {
            addDetailedRequestChange(project.id, changeRequest);
            toast.success("Change request submitted successfully");
          }}
        />
      )}
    </div>
  );
}

