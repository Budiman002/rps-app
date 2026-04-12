import { useState, useMemo, useEffect } from "react";
import { formatDate } from "@/functions/dateFormatter";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData, Seniority, UpdateProjectRequest } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle, Calendar, Sparkles, ExternalLink } from "lucide-react";
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

  // Generate unique keys for each role requirement
  const roleRequirements = useMemo(() => {
    if (!project) return [];
    return (project.RoleCompositions || []).flatMap((comp, compIndex) =>
      Array.from({ length: comp.Quantity }, (_, index) => ({
        key: `${comp.Id || compIndex}-${index}`,
        roleTitle: comp.RoleTitle,
        seniorityLevel: comp.SeniorityLevel,
        roleCompositionId: comp.Id,
      }))
    );
  }, [project]);

  // Filter available employees for each role based on start date and contract
  const getAvailableEmployees = (roleTitle: string, seniorityLevel: string, startDate?: string) => {
    const projectStartDate = startDate ? new Date(startDate) : new Date();
    const duration = project?.DurationWeeks || 0;
    const projectEndDate = new Date(projectStartDate);
    projectEndDate.setDate(projectEndDate.getDate() + duration * 7);

    return employees
      .filter((emp) => {
        if (emp.JobTitle !== roleTitle || emp.SeniorityLevel !== seniorityLevel) return false;
        if (emp.IsUnavailable) return false;
        
        // Availability: If contract, check if it ends after the project estimated end date
        if (emp.ContractType === "Contract" && emp.ContractEndDate) {
          const contractEnd = new Date(emp.ContractEndDate);
          if (contractEnd < projectEndDate) return false;
        }
        
        return true;
      })
      .sort((a, b) => b.YearsOfExperience - a.YearsOfExperience); // Step 15: Sort by experience
  };

  // Check resource availability and calculate recommended start date
  const resourceAvailability = useMemo(() => {
    const unavailableRoles: Array<{
      roleTitle: string;
      seniorityLevel: string;
      availableDate: string;
      dedicatedEmployees: string[];
    }> = [];

    roleRequirements.forEach((req) => {
      const available = getAvailableEmployees(req.roleTitle, req.seniorityLevel);
      if (available.length === 0) {
        const dedicated = employees.filter(
          (emp) =>
            emp.JobTitle === req.roleTitle &&
            emp.SeniorityLevel === req.seniorityLevel
        );

        // For now, let's assume they are available from today if none found
        unavailableRoles.push({
          roleTitle: req.roleTitle,
          seniorityLevel: req.seniorityLevel,
          availableDate: new Date().toISOString().split("T")[0]!,
          dedicatedEmployees: dedicated.map((e) => e.FullName),
        });
      }
    });

    let recommendedStartDate: string = "";
    if (unavailableRoles.length > 0) {
      recommendedStartDate = new Date().toISOString().split("T")[0]!;
    }

    return {
      hasUnavailableResources: unavailableRoles.length > 0,
      unavailableRoles,
      recommendedStartDate,
    };
  }, [roleRequirements, employees]);

  useEffect(() => {
    if (project && !actualStartDate) {
      setActualStartDate(project.ActualStartDate || project.ExpectedStartDate || "");
    }
  }, [project, actualStartDate]);

  // AI Auto-assignment (Step 15: Magic Fill)
  const handleAutoAssign = () => {
    if (!project || !actualStartDate) return;

    const newAssignments: Record<string, string> = { ...assignments };
    const assignedEmployeeIds = new Set(Object.values(newAssignments));

    roleRequirements.forEach((req) => {
      // Only assign if currently blank (Step 11: blank cells)
      if (newAssignments[req.key]) return;

      const availableEmployees = getAvailableEmployees(req.roleTitle, req.seniorityLevel, actualStartDate)
        .filter(emp => !assignedEmployeeIds.has(emp.Id));

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
    toast.info("Auto-filled missing assignments based on availability and experience");
  };

  const handleUpdateStartDate = () => {
    if (!resourceAvailability.recommendedStartDate) return;
    
    // Step 14: Only update local state, following "plan then save" flow
    setActualStartDate(resourceAvailability.recommendedStartDate);
    setIsStartDateAiRecommended(true);
    toast.info(`Updated planned start date to recommend date: ${formatDate(resourceAvailability.recommendedStartDate)}`);
  };

  const handleAssign = (key: string, employeeId: string) => {
    setAssignments({ ...assignments, [key]: employeeId });
    const newAiAssigned = new Set(aiAssignedKeys);
    newAiAssigned.delete(key);
    setAiAssignedKeys(newAiAssigned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;
    if (!actualStartDate) {
      toast.error("Please provide a start date");
      return;
    }

    const ZERO_GUID = "00000000-0000-0000-0000-000000000000";

    const unassignedRoles = roleRequirements.filter((req) => !assignments[req.key]);
    if (unassignedRoles.length > 0) {
      toast.error("Please assign all required roles");
      return;
    }
    
    // Step: Standardize validation logic similar to EditProject
    const invalidMembers = Object.values(assignments).filter(id => !id || id === ZERO_GUID);
    if (invalidMembers.length > 0) {
      toast.error("Please complete all team member assignments.");
      return;
    }

    setLoading(true);
    try {
      // 1. Calculate dates
      const startDate = new Date(actualStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (project.DurationWeeks || 0) * 7);
      const endDateStr = endDate.toISOString().split("T")[0];

      // 2. Prepare members
      const memberItems = roleRequirements.map((req) => ({
        EmployeeId: assignments[req.key]!,
        RoleCompositionId: req.roleCompositionId && req.roleCompositionId !== ZERO_GUID ? req.roleCompositionId : ZERO_GUID
      })).filter(m => m.EmployeeId !== ZERO_GUID && m.RoleCompositionId !== ZERO_GUID);

      const pmAssignment = roleRequirements.find((req) => req.roleTitle === "Project Manager");
      const pmId = pmAssignment && assignments[pmAssignment.key] ? assignments[pmAssignment.key] : undefined;

      const today = new Date().toISOString().split("T")[0]!;
      const statusText = actualStartDate > today ? "Scheduled" : "InProgress";

      // 3. Update project in ONE call (Step 20 & 21)
      const updatePayload: UpdateProjectRequest = {
        NewStartDate: actualStartDate || undefined,
        NewEndDate: endDateStr || undefined,
        NewStatus: statusText as any,
        AssignedPmId: (pmId && pmId !== ZERO_GUID) ? pmId : undefined,
        // CRITICAL: Must include existing roles, otherwise the backend "sync" logic will delete them!
        Roles: (project.RoleCompositions || []).map(rc => ({
          Id: rc.Id,
          RoleTitle: rc.RoleTitle,
          SeniorityLevel: rc.SeniorityLevel,
          EmploymentStatus: rc.EmploymentStatus,
          Quantity: rc.Quantity
        })), 
        Members: memberItems
      };

      await updateProject(project.Id, updatePayload);

      toast.success("Team members assigned successfully", {
        description: `Project status updated to ${statusText}. PM has been notified.`,
      });
      navigate(`/app/projects/${project.Id}`, { state: { from: location.state?.from } });
    } catch (error) {
      toast.error("Failed to assign team members");
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

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
                      onChange={(e) => setActualStartDate(e.target.value)}
                      className="border-purple-200 focus:border-purple-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Expected Start Date (from Marketing)</Label>
                    <Input
                      type="text"
                      value={formatDate(project.ExpectedStartDate)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-1">AI-Powered Smart Assignment</h4>
                  <p className="text-sm text-purple-800">
                    Get recommendations based on resource availability and experience level.
                  </p>
                </div>
              </div>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={handleAutoAssign}
                className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Magic Fill
              </Button>
            </div>

            {/* Resource Availability Warning */}
            {resourceAvailability.hasUnavailableResources && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Resources Not Available</AlertTitle>
                <AlertDescription>
                  <div className="space-y-3 mt-2">
                    <p>
                      Some required roles may be currently unavailable or dedicated to other projects.
                    </p>
                    <div className="space-y-2">
                      {resourceAvailability.unavailableRoles.map((unavailable, idx) => (
                        <div key={idx} className="text-xs bg-white/50 p-2 rounded border border-red-200">
                          <div className="font-medium">
                            {unavailable.seniorityLevel} {unavailable.roleTitle}
                          </div>
                          <div className="text-gray-600 mt-1">
                            Current Date used for planning: {formatDate(unavailable.availableDate)}
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
                                {formatDate(resourceAvailability.recommendedStartDate)}
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
                const availableEmployees = getAvailableEmployees(req.roleTitle, req.seniorityLevel, actualStartDate);
                const selectedEmployeeId = assignments[req.key];
                const selectedEmployee = employees.find(e => e.Id === selectedEmployeeId);
                
                // Step 18: Contract Check
                const projectEndDate = new Date(actualStartDate || new Date());
                projectEndDate.setDate(projectEndDate.getDate() + (project.DurationWeeks || 0) * 7);
                const isContractInsufficient = selectedEmployee?.ContractType === "Contract" && 
                                                selectedEmployee.ContractEndDate && 
                                                new Date(selectedEmployee.ContractEndDate) < projectEndDate;

                return (
                  <div key={req.key} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{req.roleTitle}</div>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {req.seniorityLevel}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Slot #{index + 1}
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
                        value={selectedEmployeeId || ""}
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
                                {emp.FullName} - {emp.YearsOfExperience}y Exp
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      
                      {/* Step 18 & 19: Contract Warning and Redirect */}
                      {isContractInsufficient && (
                        <Alert variant="destructive" className="py-2 px-3 mt-2 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          <div className="flex flex-col gap-1">
                            <AlertDescription>
                              Kontrak tidak cukup (Ends: {formatDate(selectedEmployee.ContractEndDate)})
                            </AlertDescription>
                            <Link 
                              to={`/app/employees`} 
                              className="flex items-center gap-1 font-semibold underline hover:text-red-800"
                            >
                              Manage via User Management <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </Alert>
                      )}

                      {availableEmployees.length === 0 && !selectedEmployeeId && (
                        <p className="text-xs text-red-500">
                          No {req.seniorityLevel} {req.roleTitle} available. Consider reassigning resources.
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
                <li>Assignments are suggested based on availability and experience</li>
                <li>The start date is set based on resource availability</li>
                <li>You can manually override both the start date and team assignments</li>
                <li>The Project Manager will receive a notification upon assignment</li>
                <li>Project status will be updated to "Scheduled" or "InProgress" based on start date</li>
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
