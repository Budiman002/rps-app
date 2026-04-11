import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  FileEdit,
  Calendar,
  Users,
  Building2,
  Flag,
  Clock,
  History,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RequestChangeModal } from "@/components/project-change-requests/request-change-modal";
import { ChangeRequestsSection } from "@/components/project-change-requests/change-requests-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    projects,
    employees,
    addDetailedRequestChange,
    approveChangeRequest,
    rejectChangeRequest,
  } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProjectIdForHistory, setSelectedProjectIdForHistory] =
    useState<string | null>(null);

  const project = projects.find((p) => p.Id === id);

  // Get the return path from location state, or use a default based on user role
  const getBackPath = () => {
    if (location.state?.from) {
      return location.state.from;
    }
    // Default fallback based on user role
    if (user?.role === "PM") {
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
      case "Scheduled":
        return <Badge className="bg-purple-500">Scheduled</Badge>;
      case "InProgress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "Complete":
        return <Badge className="bg-emerald-500">Completed</Badge>;
      case "Unassigned":
        return <Badge variant="secondary">Unassigned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "High":
        return <Badge className="bg-orange-500">High</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case "Low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getEmployeeDetails = (employeeId: string) => {
    return employees.find((e) => e.Id === employeeId);
  };

  // Check if current user is the PM of this project
  const pmEmployee = employees.find((e) => e.Email === user?.email);
  const isPM = user?.role === "PM" && project.AssignedPmId === pmEmployee?.Id;

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
            <h1 className="text-3xl font-bold">{project.Name}</h1>
            <p className="text-gray-500 mt-1">Project Details</p>
          </div>
          <div className="flex gap-2">
            {isPM && (
              <>
                <Button
                  onClick={() => setShowRequestModal(true)}
                  className="gap-2"
                >
                  <FileEdit className="h-4 w-4" />
                  Request Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProjectIdForHistory(project.Id)}
                  className="gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <History className="h-4 w-4" />
                  View History
                </Button>
              </>
            )}
            {user?.role === "GM" && (
              <Button
                onClick={() =>
                  navigate(`/app/projects/${project.Id}/edit`, {
                    state: { from: location.state?.from },
                  })
                }
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
                <div className="font-medium">{project.ClientName}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Flag className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Priority</div>
                <div className="font-medium">
                  {getPriorityBadge(project.Priority)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Start Date</div>
                <div className="font-medium">
                  {formatDate(
                    project.ActualStartDate || project.ExpectedStartDate,
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">End Date</div>
                <div className="font-medium">
                  {formatDate(project.EndDate || project.EstimatedEndDate)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-medium">{project.DurationWeeks} weeks</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 flex items-center justify-center text-gray-400 mt-0.5">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">
                  {getStatusBadge(project.Status)}
                </div>
              </div>
            </div>
          </div>

          {project.Description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{project.Description}</p>
              </div>
            </>
          )}

          {project.NotesFromMarketing && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes from Marketing</h3>
                <p className="text-gray-600">{project.NotesFromMarketing}</p>
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
                {project.Members?.length || 0} /{" "}
                {project.RoleCompositions?.reduce(
                  (sum, t) => sum + t.Quantity,
                  0,
                ) || 0}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {project.Members && project.Members.length > 0 ? (
            <div className="space-y-4">
              {project.Members.map((member) => {
                const employee = getEmployeeDetails(member.EmployeeId);
                return (
                  <div
                    key={member.Id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {employee ? getInitials(employee.FullName) : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {employee?.FullName || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee?.Email || ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{member.RoleTitle}</div>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {member.SeniorityLevel}
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
              {user?.role === "GM" && project.Status === "Unassigned" && (
                <Button
                  className="mt-4"
                  onClick={() => navigate(`/app/projects/${project.Id}/assign`)}
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
            {project.RoleCompositions?.map((comp, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-medium">{comp.RoleTitle}</div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="capitalize">
                    {comp.SeniorityLevel}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ×{comp.Quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change Requests (if any) */}
      {project.RequestChanges &&
        project.RequestChanges.length > 0 &&
        (user?.role === "GM" || isPM) && (
          <ChangeRequestsSection
            requests={project.RequestChanges}
            employees={employees}
            onApprove={(requestId) => {
              approveChangeRequest(project.Id, requestId);
              toast.success("Change request approved");
            }}
            onReject={(requestId) => {
              rejectChangeRequest(project.Id, requestId);
              toast.error("Change request rejected");
            }}
            canManage={user?.role === "GM"}
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
            addDetailedRequestChange(project.Id, changeRequest);
            toast.success("Change request submitted successfully");
          }}
        />
      )}

      {/* Request History Dialog */}
      <Dialog
        open={!!selectedProjectIdForHistory}
        onOpenChange={(open) => !open && setSelectedProjectIdForHistory(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request History - {project.Name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ChangeRequestsSection
              requests={project.RequestChanges || []}
              employees={employees}
              canManage={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
