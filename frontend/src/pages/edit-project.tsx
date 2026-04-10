import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData, Project, ProjectMember, Seniority } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRpsApi } from "@/functions/api/rpsApi";

export function EditProject() {
  const { id } = useParams();
  const { user } = useAuth();
  const { projects, employees, updateProject } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const rpsApi = useRpsApi();

  const project = projects.find(p => p.id === id);

  // Type helper
  type RoleComposition = Project["roleCompositions"][number];

  // Timeline state
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");

  // Role composition state
  const [roles, setRoles] = useState<RoleComposition[]>([]);

  // Team members state
  const [teamMembers, setTeamMembers] = useState<ProjectMember[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setStartDate(project.actualStartDate || project.expectedStartDate);
      setDuration(String(project.durationWeeks));
      setRoles([...project.roleCompositions]);
      setTeamMembers([...(project.members || [])]);
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
  type ProjectMemberEditable = ProjectMember;

  const handleAddRole = () => {
    setRoles([...roles, { id: `RC${Date.now()}`, roleTitle: "", seniorityLevel: "junior", employmentStatus: "dedicated", quantity: 1 }]);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleRoleChange = <K extends keyof RoleComposition>(
    index: number,
    field: K,
    value: RoleComposition[K],
  ) => {
    const updatedRoles = [...roles];
    updatedRoles[index] = { ...updatedRoles[index], [field]: value } as RoleComposition;
    setRoles(updatedRoles);
  };

  // Team member handlers
  const handleAddTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      { 
        id: `TM${Date.now()}`, 
        employeeId: "", 
        fullName: "", 
        email: "", 
        jobTitle: "", 
        seniorityLevel: "junior",
        roleCompositionId: "",
        roleTitle: ""
      }
    ]);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleTeamMemberChange = <K extends keyof ProjectMemberEditable>(
    index: number,
    field: K,
    value: ProjectMemberEditable[K],
  ) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value } as ProjectMember;
    setTeamMembers(updatedMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !duration) {
      toast.error("Please fill in timeline fields");
      return;
    }

    // Validate roles
    const invalidRoles = roles.filter(r => !r.roleTitle || r.quantity < 1);
    if (invalidRoles.length > 0) {
      toast.error("Please complete all role fields");
      return;
    }

    // Validate team members
    const invalidMembers = teamMembers.filter(m => !m.employeeId || !m.roleTitle);
    if (invalidMembers.length > 0) {
      toast.error("Please complete all team member fields");
      return;
    }

    setLoading(true);
    try {
      const durationWeeks = parseInt(duration);
      const endDate = calculateEndDate(startDate, durationWeeks);

      const payload = {
        actualStartDate: startDate,
        durationWeeks,
        endDate,
        roleCompositions: roles,
        members: teamMembers,
      };

      const result = await rpsApi.updateProject(project.id, payload);

      if (result.data) {
        // Update local mock state if necessary for immediate UI reflection
        updateProject(project.id, payload);
        toast.success("Project updated successfully");
        navigate(`/app/projects/${project.id}`, { state: { from: location.state?.from } });
      } else {
        toast.error(result.error || "Failed to update project");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
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

  const seniorities: Seniority[] = ["intern", "junior", "senior"];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => navigate(`/app/projects/${project.id}`, { state: { from: location.state?.from } })}
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
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>
              Client: {project.clientName}
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
                    <div>Start: {project.actualStartDate || project.expectedStartDate}</div>
                    <div>End: {project.endDate || project.estimatedEndDate}</div>
                    <div>Duration: {project.durationWeeks} weeks</div>
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
                              value={role.roleTitle}
                              onValueChange={(value) => handleRoleChange(index, "roleTitle", value)}
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
                              value={role.seniorityLevel}
                              onValueChange={(value) => handleRoleChange(index, "seniorityLevel", value as Seniority)}
                            >
                              <SelectTrigger id={`seniority-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {seniorities.map((s) => (
                                  <SelectItem key={s} value={s} className="capitalize">
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`allocationType-${index}`}>Allocation *</Label>
                            <Select
                              value={role.employmentStatus}
                              onValueChange={(value) => handleRoleChange(index, "employmentStatus", value as "dedicated" | "parallel")}
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
                      const employee = employees.find(e => e.id === member.employeeId);
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
                                  const emp = employees.find(e => e.id === value);
                                  if (emp) {
                                    handleTeamMemberChange(index, "employeeId", value);
                                    handleTeamMemberChange(index, "fullName", emp.fullName);
                                    handleTeamMemberChange(index, "email", emp.email);
                                    handleTeamMemberChange(index, "jobTitle", emp.jobTitle);
                                    handleTeamMemberChange(index, "roleTitle", emp.jobTitle);
                                    handleTeamMemberChange(index, "seniorityLevel", emp.seniorityLevel);
                                  }
                                }}
                              >
                                <SelectTrigger id={`employee-${index}`}>
                                  <SelectValue placeholder="Select employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                      {emp.fullName} - {emp.jobTitle} ({emp.seniorityLevel})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Input
                                value={member.roleTitle}
                                disabled
                                placeholder="Auto-filled"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Seniority</Label>
                              <Badge variant="outline" className="mt-2 capitalize">
                                {member.seniorityLevel}
                              </Badge>
                            </div>
                          </div>
                          {employee && (
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              {employee.email}
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
            onClick={() => navigate(`/app/projects/${project.id}`, { state: { from: location.state?.from } })}
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


