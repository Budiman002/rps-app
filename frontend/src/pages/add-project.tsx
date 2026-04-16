import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData, Priority, Seniority } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProjectFormData {
  name: string;
  clientName: string;
  description: string;
  expectedStartDate: string;
  duration: string;
  priority: Priority;
  notes: string;
}

interface TeamRole {
  id: string;
  role: string;
  seniority: Seniority;
  allocationType: "dedicated" | "parallel";
  count: number;
}

export function AddProject() {
  const { user } = useAuth();
  const { addProject } = useData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    name: string;
    clientName: string;
    description: string;
    expectedStartDate: string;
    duration: string;
    priority: Priority;
    notes: string;
  }>({
    name: "",
    clientName: "",
    description: "",
    expectedStartDate: "",
    duration: "",
    priority: "Medium" as Priority,
    notes: "",
  });

  const [teamRoles, setTeamRoles] = useState<TeamRole[]>([
    {
      id: "1",
      role: "Project Manager",
      seniority: "Senior",
      allocationType: "dedicated",
      count: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const calculateEndDate = (startDate: string, weeks: number) => {
    if (!startDate || !weeks) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + weeks * 7);
    return end.toISOString().split("T")[0]!;
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTeamRole = () => {
    setTeamRoles([
      ...teamRoles,
      {
        id: Date.now().toString(),
        role: "",
        seniority: "Junior",
        allocationType: "dedicated",
        count: 1,
      },
    ]);
  };

  const updateTeamRole = (
    id: string,
    field: keyof TeamRole,
    value: string | number,
  ) => {
    setTeamRoles(
      teamRoles.map((role) =>
        role.id === id ? { ...role, [field]: value } : role,
      ),
    );
  };

  const removeTeamRole = (id: string) => {
    if (teamRoles.length > 1) {
      setTeamRoles(teamRoles.filter((role) => role.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.clientName ||
      !formData.expectedStartDate ||
      !formData.duration
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.expectedStartDate);
    if (selectedDate < today) {
      toast.error("Start date cannot be in the past");
      return;
    }

    const hasEmptyRoles = teamRoles.some((role) => !role.role);
    if (hasEmptyRoles) {
      toast.error("Please specify all team roles");
      return;
    }

    setLoading(true);
    try {
      const durationWeeks = parseInt(formData.duration);
      const estimatedEndDate =
        calculateEndDate(formData.expectedStartDate, durationWeeks) || "";

      await addProject({
        Name: formData.name,
        ClientName: formData.clientName,
        Description: formData.description,
        ExpectedStartDate: formData.expectedStartDate,
        DurationWeeks: durationWeeks,
        EstimatedEndDate: estimatedEndDate,
        Priority: formData.priority,
        NotesFromMarketing: formData.notes,
        RoleCompositions: teamRoles.map((r) => ({
          RoleTitle: r.role,
          SeniorityLevel: r.seniority,
          Quantity: r.count,
          EmploymentStatus: (r.allocationType.charAt(0).toUpperCase() +
            r.allocationType.slice(1)) as "Dedicated" | "Parallel",
        })),
      });

      toast.success("Project created successfully", {
        description: "GM has been notified to assign team members",
      });
      navigate("/app/projects");
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "Marketing" && user?.role !== "GM") {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          You don't have permission to add projects
        </p>
      </div>
    );
  }

  const roleOptions = [
    "Project Manager",
    "UI/UX Designer",
    "Frontend Developer",
    "Backend Developer",
    "Mobile Developer",
    "Data Engineer",
    "QA Engineer",
    "Business Analyst",
    "Architect",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => navigate("/app/projects")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
        <h1 className="text-3xl font-bold">Add New Project</h1>
        <p className="text-gray-500 mt-1">
          Submit a new project for resource planning
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Provide details about the project for GM review and team
              assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Website Redesign"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    handleInputChange("clientName", e.target.value)
                  }
                  placeholder="e.g., TechCorp Inc."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the project scope and objectives"
                rows={4}
              />
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedStartDate">
                    Expected Start Date *
                  </Label>
                  <Input
                    id="expectedStartDate"
                    type="date"
                    value={formData.expectedStartDate}
                    onChange={(e) =>
                      handleInputChange("expectedStartDate", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (weeks) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", e.target.value)
                    }
                    placeholder="e.g., 12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated End Date</Label>
                  <Input
                    type="text"
                    value={
                      formData.expectedStartDate && formData.duration
                        ? calculateEndDate(
                            formData.expectedStartDate,
                            parseInt(formData.duration),
                          )
                        : ""
                    }
                    disabled
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Priority and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes from Marketing</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional information or special requirements"
                rows={3}
              />
            </div>

            <Separator />

            {/* Team Composition */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Team Composition</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTeamRole}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Role
                </Button>
              </div>

              <div className="space-y-3">
                {teamRoles.map((teamRole) => (
                  <div key={teamRole.id} className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Select
                        value={teamRole.role}
                        onValueChange={(value) =>
                          updateTeamRole(teamRole.id, "role", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={teamRole.seniority}
                        onValueChange={(value) =>
                          updateTeamRole(teamRole.id, "seniority", value)
                        }
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

                      <Select
                        value={teamRole.allocationType}
                        onValueChange={(value) =>
                          updateTeamRole(teamRole.id, "allocationType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dedicated">Dedicated</SelectItem>
                          <SelectItem value="parallel">Parallel</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        min="1"
                        value={teamRole.count}
                        onChange={(e) =>
                          updateTeamRole(
                            teamRole.id,
                            "count",
                            parseInt(e.target.value),
                          )
                        }
                        placeholder="Count"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamRole(teamRole.id)}
                      disabled={teamRoles.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/app/projects")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
