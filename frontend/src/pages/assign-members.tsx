import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData, TeamMember } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Users, AlertTriangle, Calendar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AssignMembers() {
  const { id } = useParams();
  const { user } = useAuth();
  const { projects, employees, assignMembers, updateProject } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const project = projects.find(p => p.Id === id);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [aiAssignedKeys, setAiAssignedKeys] = useState<Set<string>>(new Set());
  const [actualStartDate, setActualStartDate] = useState("");
  const [isStartDateAiRecommended, setIsStartDateAiRecommended] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <Button onClick={() => navigate("/app/projects")}>Back to Projects</Button>
      </div>
    );
  }

  if (user?.role !== "GM") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-4">Only GMs can assign team members</p>
        <Button onClick={() => navigate("/app/projects")}>Back to Projects</Button>
      </div>
    );
  }

  // Generate unique keys for each role requirement
  const roleRequirements = useMemo(() => {
    return (project.RoleCompositions || []).flatMap((comp, compIndex) =>
      Array.from({ length: comp.Quantity }, (_, index) => ({
        key: `${comp.RoleTitle}-${comp.SeniorityLevel}-${compIndex}-${index}`,
        role: comp.RoleTitle,
        seniority: comp.SeniorityLevel,
      }))
    );
  }, [project]);

  // Filter available employees for each role based on start date
  const getAvailableEmployees = (role: string, seniority: string, startDate?: string) => {
    return employees.filter((emp) => {
      if (emp.JobTitle !== role || emp.SeniorityLevel !== seniority) return false;

      // Simple availability check: if they have a contract that ends before start date
      if (startDate && emp.ContractType === "Contract" && emp.ContractEndDate) {
          return new Date(emp.ContractEndDate) < new Date(startDate);
      }
      
      // For now, assume Available if not explicitly marked Unavailable
      return !emp.IsUnavailable;
    });
  };

  // Check resource availability and calculate recommended start date
  const resourceAvailability = useMemo(() => {
    const unavailableRoles: Array<{
      role: string;
      seniority: string;
      availableDate: string;
      dedicatedEmployees: string[];
    }> = [];

    roleRequirements.forEach((req) => {
      const available = getAvailableEmployees(req.role, req.seniority);
      if (available.length === 0) {
        // Mocking some fallback for demo/consistency if needed, 
        // but let's keep it simple for now as we don't have complex project assignment state on employees yet
        const dedicated = employees.filter(
          (emp) =>
            emp.JobTitle === req.role &&
            emp.SeniorityLevel === req.seniority &&
            emp.IsUnavailable
        );

        unavailableRoles.push({
            role: req.role,
            seniority: req.seniority,
            availableDate: new Date().toISOString().split("T")[0]!,
            dedicatedEmployees: dedicated.map((e) => e.FullName),
        });
      }
    });

    // Calculate recommended start date (latest of all earliest dates)
    let recommendedStartDate: string = "";
    if (unavailableRoles.length > 0) {
      recommendedStartDate = new Date().toISOString().split("T")[0]!;
    }

    return {
      hasUnavailableResources: unavailableRoles.length > 0,
      unavailableRoles,
      recommendedStartDate,
    };
  }, [roleRequirements, employees, projects]);

  // Auto-populate start date when component loads or resource availability changes
  useEffect(() => {
    if (project && !actualStartDate) {
      setActualStartDate(project.ActualStartDate || project.ExpectedStartDate);
      setIsStartDateAiRecommended(false);
    }
  }, [project]);

  // AI Auto-assignment on component mount (runs after start date is set)
  useEffect(() => {
    if (!project || !actualStartDate) return;

    const newAssignments: Record<string, string> = {};
    const assignedEmployeeIds = new Set<string>();

    roleRequirements.forEach((req) => {
      let availableEmployees = employees.filter((emp) => {
        if (emp.JobTitle !== req.role || emp.SeniorityLevel !== req.seniority) return false;
        if (assignedEmployeeIds.has(emp.Id)) return false;
        return !emp.IsUnavailable;
      });

      if (availableEmployees.length > 0) {
        const selectedEmployee = availableEmployees[0];
        if (selectedEmployee) {
          newAssignments[req.key] = selectedEmployee.Id;
          assignedEmployeeIds.add(selectedEmployee.Id);
        }
      }
    });

    setAssignments(newAssignments);
    setAiAssignedKeys(new Set(Object.keys(newAssignments)));
  }, [project, roleRequirements, employees, actualStartDate, projects]);

  const handleUpdateStartDate = () => {
    if (!resourceAvailability.recommendedStartDate) return;
    setActualStartDate(resourceAvailability.recommendedStartDate);
  };

  const handleAssign = (key: string, employeeId: string) => {
    setAssignments({ ...assignments, [key]: employeeId });
    const newAiAssigned = new Set(aiAssignedKeys);
    newAiAssigned.delete(key);
    setAiAssignedKeys(newAiAssigned);
  };

  const handleStartDateChange = (date: string) => {
    setActualStartDate(date);
    setIsStartDateAiRecommended(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!actualStartDate) {
      toast.error("Please provide a start date");
      return;
    }

    const unassignedRoles = roleRequirements.filter((req) => !assignments[req.key]);
    if (unassignedRoles.length > 0) {
      toast.error("Please assign all required roles");
      return;
    }

    setLoading(true);
    try {
      const teamMembers: TeamMember[] = roleRequirements
        .filter(req => assignments[req.key])
        .map((req) => ({
          id: `TM${Date.now()}-${Math.random()}`,
          employeeId: assignments[req.key]!,
          role: req.role,
          seniority: req.seniority as any,
        }));

      const pmAssignment = roleRequirements.find((req) => req.role === "Project Manager");
      const pmId = pmAssignment ? assignments[pmAssignment.key] : "";

      // Update project with actual dates first
      const currentId = project.Id;
      if (!currentId) throw new Error("Project ID is missing");
      const todayDate = new Date().toISOString().split("T")[0]!;

      await updateProject(currentId, {
        ActualStartDate: actualStartDate,
        Status: actualStartDate > todayDate ? "Scheduled" : "InProgress"
      });

      // Then assign team members
      await assignMembers(currentId, teamMembers, pmId!);

      toast.success("Team members assigned successfully");
      navigate(`/app/projects/${project.Id}`, { state: { from: location.state?.from } });
    } catch (error) {
      toast.error("Failed to assign team members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => navigate(`/app/projects/${project.Id}`, { state: { from: location.state?.from } })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>
        <h1 className="text-3xl font-bold">Assign Team Members</h1>
        <p className="text-gray-500 mt-1">Select employees for each required role</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{project.Name}</CardTitle>
            <CardDescription>
              Client: {project.ClientName} • Duration: {project.DurationWeeks} weeks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Start Date Section */}
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <Label htmlFor="actualStartDate" className="text-base font-semibold text-purple-900">
                      Project Start Date *
                    </Label>
                  </div>
                  {isStartDateAiRecommended && (
                    <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-100 gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Recommended
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="actualStartDate" className="text-sm text-gray-600">
                      Actual Start Date
                    </Label>
                    <Input
                      id="actualStartDate"
                      type="date"
                      value={actualStartDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Expected Start Date (from Marketing)</Label>
                    <Input
                      type="text"
                      value={new Date(project.ExpectedStartDate).toLocaleDateString()}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                {isStartDateAiRecommended && (
                  <p className="text-xs text-purple-800 flex items-start gap-2">
                    <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      AI has recommended this start date based on resource availability. All required team members will be available by this date.
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-1">AI-Powered Smart Assignment</h4>
                  <p className="text-sm text-purple-800">
                    Our AI has automatically analyzed resource availability and assigned the optimal team composition.
                    The start date is set based on when all required resources will be available.
                    You can manually edit any assignment or the start date as needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Resource Availability Warning */}
            {resourceAvailability.hasUnavailableResources && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Resources Not Available</AlertTitle>
                <AlertDescription>
                  <div className="space-y-3 mt-2">
                    <p>
                      Some required roles are currently unavailable. Resources will become available after ongoing projects complete.
                    </p>
                    <div className="space-y-2">
                      {resourceAvailability.unavailableRoles.map((unavailable, idx) => (
                        <div key={idx} className="text-xs bg-white/50 p-2 rounded border border-red-200">
                          <div className="font-medium">
                            {unavailable.seniority} {unavailable.role}
                          </div>
                          <div className="text-gray-600 mt-1">
                            Current Date used for planning: {new Date(unavailable.availableDate).toLocaleDateString()}
                          </div>
                          <div className="text-gray-600 text-[11px] mt-0.5">
                            Currently unavailable team: {unavailable.dedicatedEmployees.join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                    {resourceAvailability.recommendedStartDate && (
                      <div className="bg-white p-3 rounded-lg border border-red-200 mt-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Recommended Start Date
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              {new Date(resourceAvailability.recommendedStartDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Expected start date: {new Date(project.ExpectedStartDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={handleUpdateStartDate}
                            className="shrink-0"
                          >
                            Update Project Date
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {roleRequirements.map((req, index) => {
                const availableEmployees = getAvailableEmployees(req.role, req.seniority, actualStartDate);
                const selectedEmployeeId = assignments[req.key];

                return (
                  <div key={req.key} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{req.role}</div>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {req.seniority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        #{index + 1} of {roleRequirements.length}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`assign-${req.key}`}>Select Employee *</Label>
                        {aiAssignedKeys.has(req.key) && selectedEmployeeId && (
                          <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50 gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI Recommended
                          </Badge>
                        )}
                      </div>
                      <Select
                        value={selectedEmployeeId}
                        onValueChange={(value) => handleAssign(req.key, value)}
                      >
                        <SelectTrigger id={`assign-${req.key}`}>
                          <SelectValue placeholder="Choose an employee..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEmployees.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500">
                              No available employees for this role
                            </div>
                          ) : (
                            availableEmployees.map((emp) => (
                              <SelectItem key={emp.Id} value={emp.Id}>
                                {emp.FullName} - {emp.Email}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {availableEmployees.length === 0 && (
                        <p className="text-xs text-red-500">
                          No {req.seniority} {req.role} available. Consider reassigning resources.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Important</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>AI has automatically assigned team members based on availability and experience</li>
                <li>The start date is automatically set based on resource availability</li>
                <li>You can manually override both the start date and team assignments</li>
                <li>Assigned employees will be marked as dedicated to this project</li>
                <li>The Project Manager will receive a notification</li>
                <li>Project status will be "Scheduled" if start date is in the future, or "In Progress" if today or past</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/app/projects/${project.Id}`, { state: { from: location.state?.from } })}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Assigning..." : "Assign Team"}
          </Button>
        </div>
      </form>
    </div>
  );
}

