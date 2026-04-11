import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData, Project, ProjectMember, Seniority, UpdateProjectRequest } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react";

export function EditProject() {
  const { id } = useParams();
  const { user } = useAuth();
  const { projects, employees, updateProject } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const project = projects.find(p => p.Id === id);

  // Type helper for local selection state
  type RoleCompositionLocal = { 
    id: string; // GUID or temp
    roleTitle: string; 
    seniorityLevel: Seniority; 
    employmentStatus: "Dedicated" | "Parallel"; 
    quantity: number 
  };
  
  // Timeline state
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [endDate, setEndDate] = useState("");

  // Role composition state
  const [roles, setRoles] = useState<RoleCompositionLocal[]>([]);

  // Team members state
  const [teamMembers, setTeamMembers] = useState<ProjectMember[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setStartDate(project.ActualStartDate || project.ExpectedStartDate || "");
      setDuration(String(project.DurationWeeks || 0));
      setEndDate(project.EndDate || project.EstimatedEndDate || "");
      
      const mappedRoles = (project.RoleCompositions || []).map(rc => ({
        id: rc.Id || crypto.randomUUID(),
        roleTitle: rc.RoleTitle,
        seniorityLevel: rc.SeniorityLevel,
        employmentStatus: rc.EmploymentStatus,
        quantity: rc.Quantity
      }));
      setRoles(mappedRoles);
      
      setTeamMembers([...(project.Members || [])]);
    }
  }, [project]);

  const isStartDateEditable = useMemo(() => {
    return project?.Status !== "InProgress";
  }, [project]);

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
        <p className="text-gray-500 mb-4">Only GMs can edit projects</p>
        <Button onClick={() => navigate("/app/projects")}>Back to Projects</Button>
      </div>
    );
  }

  // Helper functions for date calculations
  const calculateEndDate = (start: string, weeks: number): string => {
    if (!start || !weeks || isNaN(weeks)) return "";
    const startD = new Date(start);
    const end = new Date(startD);
    end.setDate(end.getDate() + weeks * 7);
    return end.toISOString().split("T")[0] || "";
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  };

  // Timeline Handlers
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (duration) {
      setEndDate(calculateEndDate(val, parseInt(duration)));
    }
  };

  const handleDurationChange = (val: string) => {
    setDuration(val);
    const weeks = parseInt(val);
    if (startDate && !isNaN(weeks)) {
      setEndDate(calculateEndDate(startDate, weeks));
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (startDate) {
      setDuration(String(calculateDuration(startDate, val)));
    }
  };

  // Role composition handlers
  const handleAddRole = () => {
    setRoles([...roles, { 
      id: crypto.randomUUID(), 
      roleTitle: "", 
      seniorityLevel: "Junior", 
      employmentStatus: "Dedicated", 
      quantity: 1 
    }]);
  };

  const handleRemoveRole = (index: number) => {
    const roleToRemove = roles[index];
    setRoles(roles.filter((_, i) => i !== index));
    // Also remove team members associated with this role
    if (roleToRemove) {
        setTeamMembers(teamMembers.filter(m => m.RoleCompositionId !== roleToRemove.id));
    }
  };

  const handleRoleChange = <K extends keyof RoleCompositionLocal>(
    index: number,
    field: K,
    value: RoleCompositionLocal[K],
  ) => {
    const updatedRoles = [...roles];
    if (updatedRoles[index]) {
      updatedRoles[index] = { ...updatedRoles[index], [field]: value };
      setRoles(updatedRoles);
    }
  };

  // Team member handlers
  const handleAddTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      { 
        Id: crypto.randomUUID(), 
        EmployeeId: "", 
        FullName: "", 
        Email: "", 
        JobTitle: "", 
        SeniorityLevel: "Junior",
        RoleCompositionId: "",
        RoleTitle: ""
      }
    ]);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleTeamMemberChange = (index: number, updates: Partial<ProjectMember>) => {
    setTeamMembers(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...updates };
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // "Only allow all field filled or nothing. Not half filled."
    const invalidRoles = roles.filter(r => !r.roleTitle || r.quantity < 1);
    if (invalidRoles.length > 0) {
      toast.error("Please complete all role fields or remove the incomplete role");
      return;
    }

    const invalidMembers = teamMembers.filter(m => !m.EmployeeId || !m.RoleCompositionId);
    if (invalidMembers.length > 0) {
      toast.error("Please complete all team member fields (including Role) or remove the incomplete member");
      return;
    }

    setLoading(true);
    try {
      const payload: UpdateProjectRequest = {
        NewStartDate: startDate || undefined,
        NewDurationWeeks: duration ? parseInt(duration) : undefined,
        NewEndDate: endDate || undefined,
        Roles: roles.map(r => ({
          Id: r.id,
          RoleTitle: r.roleTitle,
          SeniorityLevel: r.seniorityLevel,
          EmploymentStatus: r.employmentStatus,
          Quantity: r.quantity
        })),
        Members: teamMembers.map(m => ({
          EmployeeId: m.EmployeeId,
          RoleCompositionId: m.RoleCompositionId
        })),
      };

      await updateProject(project.Id, payload);
      toast.success("Project updated successfully");
      navigate(`/app/projects/${project.Id}`, { state: { from: location.state?.from } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = [
    "Project Manager",
    "UI/UX Designer",
    "Frontend Developer",
    "Backend Developer",
    "Mobile Developer",
    "Data Engineer",
    "QA Engineer",
    "DevOps Engineer",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => navigate(`/app/projects/${project.Id}`, { state: { from: location.state?.from } })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>
        <h1 className="text-3xl font-bold">Edit Project Plan</h1>
        <p className="text-gray-500 mt-1">Review and synchronize project timeline, roles, and assignments</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{project.Name}</CardTitle>
            <CardDescription>
              Client: {project.ClientName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="roles">Role Composition</TabsTrigger>
                <TabsTrigger value="members">Team Members</TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4 mt-4 text-left">
                {!isStartDateEditable && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      Project is In Progress. Start Date is read-only. Adjust Duration or End Date to update the timeline.
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      disabled={!isStartDateEditable}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (weeks)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Original Baseline</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Expected Start: {project.ExpectedStartDate ? new Date(project.ExpectedStartDate).toLocaleDateString() : "N/A"}</div>
                    <div>Estimated End: {project.EstimatedEndDate ? new Date(project.EstimatedEndDate).toLocaleDateString() : "N/A"}</div>
                  </div>
                </div>
              </TabsContent>

              {/* Role Composition Tab */}
              <TabsContent value="roles" className="space-y-4 mt-4 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Resource Budget</h3>
                    <p className="text-sm text-gray-500">Define the skills and quantities required</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRole}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </div>

                {roles.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-gray-500">No roles defined in the budget</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {roles.map((role, index) => (
                      <div key={role.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Budget Entry #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRole(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-2">
                            <Label>Role Title</Label>
                            <Select
                              value={role.roleTitle}
                              onValueChange={(value) => handleRoleChange(index, "roleTitle", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRoles.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {r}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Seniority</Label>
                            <Select
                              value={role.seniorityLevel}
                              onValueChange={(value) => handleRoleChange(index, "seniorityLevel", value as Seniority)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Intern">Intern</SelectItem>
                                <SelectItem value="Junior">Junior</SelectItem>
                                <SelectItem value="Senior">Senior</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Allocation</Label>
                            <Select
                              value={role.employmentStatus}
                              onValueChange={(value) => handleRoleChange(index, "employmentStatus", value as "Dedicated" | "Parallel")}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Dedicated">Dedicated</SelectItem>
                                <SelectItem value="Parallel">Parallel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Headcount</Label>
                            <Input
                              type="number"
                              min="1"
                              value={role.quantity}
                              onChange={(e) => handleRoleChange(index, "quantity", parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Team Members Tab */}
              <TabsContent value="members" className="space-y-4 mt-4 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Personnel Assignment</h3>
                    <p className="text-sm text-gray-500">Assign employees to the roles defined in the budget</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTeamMember}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Assign Member
                  </Button>
                </div>

                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-gray-500">No personnel assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member, index) => {
                      return (
                        <div key={member.Id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                              Assignment #{index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTeamMember(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Practitioner</Label>
                              <Select
                                value={member.EmployeeId}
                                onValueChange={(value) => {
                                  const emp = employees.find(e => e.Id === value);
                                  if (emp) {
                                    handleTeamMemberChange(index, {
                                      EmployeeId: value,
                                      FullName: emp.FullName,
                                      Email: emp.Email,
                                      JobTitle: emp.JobTitle,
                                      SeniorityLevel: emp.SeniorityLevel
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {employees.map((emp) => (
                                    <SelectItem key={emp.Id} value={emp.Id}>
                                      {emp.FullName} - {emp.JobTitle}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Filling Role (from Budget)</Label>
                              <Select
                                value={member.RoleCompositionId}
                                onValueChange={(value) => {
                                  const role = roles.find(r => r.id === value);
                                  if (role) {
                                    handleTeamMemberChange(index, {
                                      RoleCompositionId: value,
                                      RoleTitle: role.roleTitle
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role from budget..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      {role.roleTitle} ({role.seniorityLevel})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
            {loading ? "Synchronizing..." : "Save All Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
