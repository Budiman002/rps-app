import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData, Project, TeamMember, Seniority } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export function EditProject() {
  const { id } = useParams();
  const { user } = useAuth();
  const { projects, employees, updateProject } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const project = projects.find(p => p.Id === id);

  // Timeline state
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");

  // Role composition state
  const [roles, setRoles] = useState<Array<{ role: string; seniority: Seniority; allocationType: "dedicated" | "parallel"; count: number }>>([]);

  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setStartDate(project.ActualStartDate || project.ExpectedStartDate || "");
      setDuration(String(project.DurationWeeks || 0));
      
      const mappedRoles = (project.RoleCompositions || []).map(rc => ({
        role: rc.RoleTitle,
        seniority: rc.SeniorityLevel as any,
        allocationType: rc.EmploymentStatus as "dedicated" | "parallel",
        count: rc.Quantity
      }));
      setRoles(mappedRoles);
      
      const mappedMembers = (project.Members || []).map(m => ({
        id: m.Id,
        employeeId: m.Id,
        role: m.JobTitle,
        seniority: m.SeniorityLevel as any
      }));
      setTeamMembers(mappedMembers);
    }
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

  const calculateEndDate = (start: string, weeks: number) => {
    if (!start || !weeks) return "";
    const startD = new Date(start);
    const end = new Date(startD);
    end.setDate(end.getDate() + weeks * 7);
    return end.toISOString().split("T")[0];
  };

  // Role composition handlers
  type RoleCompositionLocal = { role: string; seniority: Seniority; allocationType: "dedicated" | "parallel"; count: number };
  type TeamMemberEditable = TeamMember;

  const handleAddRole = () => {
    setRoles([...roles, { role: "", seniority: "Junior", allocationType: "dedicated", count: 1 }]);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleRoleChange = <K extends keyof RoleCompositionLocal>(
    index: number,
    field: K,
    value: RoleCompositionLocal[K],
  ) => {
    const updatedRoles = [...roles];
    const currentRole = updatedRoles[index];
    if (currentRole) {
      updatedRoles[index] = { ...currentRole, [field]: value };
      setRoles(updatedRoles);
    }
  };

  // Team member handlers
  const handleAddTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      { id: `TM${Date.now()}`, employeeId: "", role: "", seniority: "Junior" as any }
    ]);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleTeamMemberChange = <K extends keyof TeamMemberEditable>(
    index: number,
    field: K,
    value: TeamMemberEditable[K],
  ) => {
    const updatedMembers = [...teamMembers];
    const currentMember = updatedMembers[index];
    if (currentMember) {
      updatedMembers[index] = { ...currentMember, [field]: value };
      setTeamMembers(updatedMembers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !duration) {
      toast.error("Please fill in timeline fields");
      return;
    }

    const invalidRoles = roles.filter(r => !r.role || r.count < 1);
    if (invalidRoles.length > 0) {
      toast.error("Please complete all role fields");
      return;
    }

    setLoading(true);
    try {
      const durationWeeks = parseInt(duration);
      const endDate = calculateEndDate(startDate, durationWeeks);

      await updateProject(project.Id, {
        ActualStartDate: startDate,
        DurationWeeks: durationWeeks,
        RoleCompositions: roles.map(r => ({
           RoleTitle: r.role,
           SeniorityLevel: r.seniority,
           Quantity: r.count,
           EmploymentStatus: r.allocationType
        }))
        // Note: Members update might need a separate call depending on backend
      });

      toast.success("Project updated successfully");
      navigate(`/app/projects/${project.Id}`, { state: { from: location.state?.from } });
    } catch (error) {
      toast.error("Failed to update project");
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

  const seniorities: Seniority[] = ["Intern", "Junior", "Senior"];

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
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-gray-500 mt-1">Update project timeline, roles, and team members</p>
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
              <TabsContent value="timeline" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (weeks) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="text"
                      value={
                        startDate && duration
                          ? calculateEndDate(startDate, parseInt(duration))
                          : ""
                      }
                      disabled
                      placeholder="Auto-calculated"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Current Timeline</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Start: {project.ActualStartDate || project.ExpectedStartDate}</div>
                    <div>End: {project.EndDate || project.EstimatedEndDate}</div>
                    <div>Duration: {project.DurationWeeks} weeks</div>
                  </div>
                </div>
              </TabsContent>

              {/* Role Composition Tab */}
              <TabsContent value="roles" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Define the required roles and their quantities for this project
                  </p>
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
                    <p className="text-gray-500 mb-3">No roles added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddRole}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Role
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {roles.map((role, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Role #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRole(index)}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`role-${index}`}>Role *</Label>
                            <Select
                              value={role.role}
                              onValueChange={(value) => handleRoleChange(index, "role", value)}
                            >
                              <SelectTrigger id={`role-${index}`}>
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
                            <Label htmlFor={`seniority-${index}`}>Seniority *</Label>
                            <Select
                              value={role.seniority}
                              onValueChange={(value) => handleRoleChange(index, "seniority", value as Seniority)}
                            >
                              <SelectTrigger id={`seniority-${index}`}>
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
                            <Label htmlFor={`allocationType-${index}`}>Allocation *</Label>
                            <Select
                              value={role.allocationType}
                              onValueChange={(value) => handleRoleChange(index, "allocationType", value as "dedicated" | "parallel")}
                            >
                              <SelectTrigger id={`allocationType-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dedicated">Dedicated</SelectItem>
                                <SelectItem value="parallel">Parallel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`count-${index}`}>Count *</Label>
                            <Input
                              id={`count-${index}`}
                              type="number"
                              min="1"
                              value={role.count}
                              onChange={(e) => handleRoleChange(index, "count", parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Team Members Tab */}
              <TabsContent value="members" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Assign specific employees to this project
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTeamMember}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                </div>

                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-gray-500 mb-3">No team members assigned yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTeamMember}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Member
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member, index) => {
                      const employee = employees.find(e => e.Id === member.employeeId);
                      return (
                        <div key={member.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                              Member #{index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTeamMember(index)}
                              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`employee-${index}`}>Employee *</Label>
                              <Select
                                value={member.employeeId}
                                onValueChange={(value) => {
                                  const emp = employees.find(e => e.Id === value);
                                  if (emp) {
                                    handleTeamMemberChange(index, "employeeId", value);
                                    handleTeamMemberChange(index, "role", emp.JobTitle);
                                    handleTeamMemberChange(index, "seniority", emp.SeniorityLevel as any);
                                  }
                                }}
                              >
                                <SelectTrigger id={`employee-${index}`}>
                                  <SelectValue placeholder="Select employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {employees.map((emp) => (
                                    <SelectItem key={emp.Id} value={emp.Id}>
                                      {emp.FullName} - {emp.JobTitle} ({emp.SeniorityLevel})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Input
                                value={member.role}
                                disabled
                                placeholder="Auto-filled"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Seniority</Label>
                              <Badge variant="outline" className="mt-2 capitalize">
                                {member.seniority}
                              </Badge>
                            </div>
                          </div>
                          {employee && (
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              {employee.Email}
                            </div>
                          )}
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
            {loading ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}


