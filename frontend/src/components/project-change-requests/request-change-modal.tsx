import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Plus, X, Calendar, Users, Briefcase } from "lucide-react";
import { ChangeRequest, Project, Employee, Seniority } from "@/contexts/data-context";
import { toast } from "sonner";

interface RequestChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  employees: Employee[];
  onSubmit: (changeRequest: ChangeRequest) => void;
}

export function RequestChangeModal({ open, onOpenChange, project, employees, onSubmit }: RequestChangeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [includeTimeline, setIncludeTimeline] = useState(false);
  const [includeRoles, setIncludeRoles] = useState(false);
  const [includeEmployees, setIncludeEmployees] = useState(false);

  const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseISODate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const addDays = (value: string, days: number) => {
    const date = parseISODate(value);
    if (!date) return value;
    date.setDate(date.getDate() + days);
    return formatISODate(date);
  };

  const formatDMY = (value?: string) => {
    if (!value) return "-";
    const date = parseISODate(value);
    if (!date) return value;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDurationWeeks = (start: string, end: string) => {
    const startDate = parseISODate(start);
    const endDate = parseISODate(end);
    if (!startDate || !endDate) return 1;
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    return Math.max(1, Math.round(diffDays / 7));
  };

  const getEndFromDuration = (start: string, duration: number) => {
    return addDays(start, Math.max(1, duration) * 7);
  };

  const tomorrowISO = useMemo(() => {
    const tomorrow = getToday();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatISODate(tomorrow);
  }, []);

  const currentStartDate = project.startDate || project.expectedStartDate;
  const currentEndDate = project.endDate || project.estimatedEndDate;

  // Timeline changes
  const [newStartDate, setNewStartDate] = useState(currentStartDate);
  const [newEndDate, setNewEndDate] = useState(currentEndDate);
  const [newDuration, setNewDuration] = useState(project.duration);

  // Role changes
  const [roleChanges, setRoleChanges] = useState<{
    added: Array<{ role: string; seniority: Seniority; allocationType: "dedicated" | "parallel"; count: number }>;
    removed: Array<{ role: string; seniority: Seniority; allocationType: "dedicated" | "parallel"; count: number }>;
    modified: Array<{ role: string; seniority: Seniority; allocationType: "dedicated" | "parallel"; oldCount: number; newCount: number }>;
  }>({
    added: [],
    removed: [],
    modified: [],
  });

  // Employee changes
  const [employeeChanges, setEmployeeChanges] = useState<{
    added: Array<{ employeeId: string; role: string; seniority: Seniority }>;
    removed: Array<{ employeeId: string; role: string; seniority: Seniority }>;
  }>({
    added: [],
    removed: [],
  });

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setIncludeTimeline(false);
    setIncludeRoles(false);
    setIncludeEmployees(false);
    setNewStartDate(currentStartDate);
    setNewEndDate(currentEndDate);
    setNewDuration(project.duration);
    setRoleChanges({ added: [], removed: [], modified: [] });
    setEmployeeChanges({ added: [], removed: [] });
  }, [open, currentStartDate, currentEndDate, project.duration]);

  const endDateMin = addDays(newStartDate, 1);

  const onChangeStartDate = (value: string) => {
    const nextStart = value;
    setNewStartDate(nextStart);
    const minEnd = addDays(nextStart, 1);
    const adjustedEnd = newEndDate < minEnd ? minEnd : newEndDate;
    setNewEndDate(adjustedEnd);
    setNewDuration(getDurationWeeks(nextStart, adjustedEnd));
  };

  const onChangeEndDate = (value: string) => {
    const adjustedEnd = value < endDateMin ? endDateMin : value;
    setNewEndDate(adjustedEnd);
    setNewDuration(getDurationWeeks(newStartDate, adjustedEnd));
  };

  const onChangeDuration = (value: string) => {
    const duration = Math.max(1, parseInt(value, 10) || 1);
    setNewDuration(duration);
    setNewEndDate(getEndFromDuration(newStartDate, duration));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please provide a title for the change request");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description for the change request");
      return;
    }

    if (!includeTimeline && !includeRoles && !includeEmployees) {
      toast.error("Please choose at least one change section");
      return;
    }

    const changes: NonNullable<ChangeRequest["changes"]> = {};

    const selectedSections: Array<"timeline" | "roles" | "employees"> = [];

    if (includeTimeline) {
      if (newStartDate < tomorrowISO) {
        toast.error("New Start Date must be at least tomorrow (H+1)");
        return;
      }

      if (newEndDate < addDays(newStartDate, 1)) {
        toast.error("New End Date must be at least one day after New Start Date");
        return;
      }

      const timelineChanged =
        newStartDate !== currentStartDate ||
        newEndDate !== currentEndDate ||
        newDuration !== project.duration;

      if (!timelineChanged) {
        toast.error("Timeline section is selected but no timeline change was made");
        return;
      }

      changes.timeline = {
        oldStartDate: currentStartDate,
        newStartDate,
        oldEndDate: currentEndDate,
        newEndDate,
        oldDuration: project.duration,
        newDuration,
      };
      selectedSections.push("timeline");
    }

    if (includeRoles) {
      const cleanedAdded = roleChanges.added.filter((r) => r.role.trim().length > 0);
      const cleanedRemoved = roleChanges.removed.filter((r) => r.role.trim().length > 0);
      const cleanedModified = roleChanges.modified.filter((r) => r.role.trim().length > 0);

      if (cleanedAdded.length === 0 && cleanedRemoved.length === 0 && cleanedModified.length === 0) {
        toast.error("Roles section is selected but no valid role change was provided");
        return;
      }

      changes.roles = {
        added: cleanedAdded,
        removed: cleanedRemoved,
        modified: cleanedModified,
      };
      selectedSections.push("roles");
    }

    if (includeEmployees) {
      const cleanedAdded = employeeChanges.added.filter((e) => e.employeeId.trim().length > 0);
      const cleanedRemoved = employeeChanges.removed.filter((e) => e.employeeId.trim().length > 0);

      if (cleanedAdded.length === 0 && cleanedRemoved.length === 0) {
        toast.error("Team Members section is selected but no valid member change was provided");
        return;
      }

      changes.employees = {
        added: cleanedAdded,
        removed: cleanedRemoved,
      };
      selectedSections.push("employees");
    }

    const requestType: ChangeRequest["type"] =
      selectedSections.length > 1 ? "general" : (selectedSections[0] ?? "general");

    const changeRequest: ChangeRequest = {
      id: `REQ${Date.now()}`,
      title,
      description,
      type: requestType,
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
      changes,
    };

    onSubmit(changeRequest);
    onOpenChange(false);
  };

  const addRoleChange = (type: "added" | "removed") => {
    if (type === "added") {
      setRoleChanges({
        ...roleChanges,
        added: [...roleChanges.added, { role: "", seniority: "junior", allocationType: "dedicated", count: 1 }],
      });
    } else {
      setRoleChanges({
        ...roleChanges,
        removed: [...roleChanges.removed, { role: "", seniority: "junior", allocationType: "dedicated", count: 1 }],
      });
    }
  };

  const addEmployeeChange = (type: "added" | "removed") => {
    if (type === "added") {
      setEmployeeChanges({
        ...employeeChanges,
        added: [...employeeChanges.added, { employeeId: "", role: "", seniority: "junior" }],
      });
    } else {
      setEmployeeChanges({
        ...employeeChanges,
        removed: [...employeeChanges.removed, { employeeId: "", role: "", seniority: "junior" }],
      });
    }
  };

  const availableEmployees = employees.filter(e => 
    !project.assignedMembers?.some(m => m.employeeId === e.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[94vw] lg:w-[92vw] sm:max-w-none lg:max-w-[1200px] xl:max-w-[1320px] max-h-[92vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Request Project Change</DialogTitle>
          <DialogDescription>
            Submit a change request for {project.name}. The GM will review and approve or reject your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Change Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Extend project timeline by 2 weeks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide details about why this change is needed..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-5">
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeTimeline"
                  checked={includeTimeline}
                  onCheckedChange={(checked) => setIncludeTimeline(Boolean(checked))}
                />
                <Label htmlFor="includeTimeline" className="flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </Label>
              </div>
              {includeTimeline && (
                <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Start Date</Label>
                  <Input value={formatDMY(currentStartDate)} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newStartDate">New Start Date</Label>
                  <Input
                    id="newStartDate"
                    type="date"
                    min={tomorrowISO}
                    value={newStartDate}
                    onChange={(e) => onChangeStartDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Display: {formatDMY(newStartDate)} (DD/MM/YYYY)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current End Date</Label>
                  <Input value={formatDMY(currentEndDate)} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEndDate">New End Date</Label>
                  <Input
                    id="newEndDate"
                    type="date"
                    min={endDateMin}
                    value={newEndDate}
                    onChange={(e) => onChangeEndDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Display: {formatDMY(newEndDate)} (DD/MM/YYYY)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Duration</Label>
                  <Input value={`${project.duration} weeks`} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newDuration">New Duration (weeks)</Label>
                  <Input
                    id="newDuration"
                    type="number"
                    min={1}
                    value={newDuration}
                    onChange={(e) => onChangeDuration(e.target.value)}
                  />
                </div>
              </div>
                </>
              )}
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeRoles"
                  checked={includeRoles}
                  onCheckedChange={(checked) => setIncludeRoles(Boolean(checked))}
                />
                <Label htmlFor="includeRoles" className="flex items-center gap-2 text-base font-semibold">
                  <Briefcase className="h-4 w-4" />
                  Roles
                </Label>
              </div>
              {includeRoles && (
                <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Add New Roles</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addRoleChange("added")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </div>
                
                {roleChanges.added.map((role, index) => (
                                  <div key={index} className="flex flex-col xl:flex-row xl:items-end gap-2">
                    <div className="flex-1">
                      <Input
                                        placeholder="Role name (e.g., Backend Developer)"
                                        className="w-full min-w-[16rem]"
                        value={role.role}
                        onChange={(e) => {
                          const updated = [...roleChanges.added];
                          const row = updated[index];
                          if (!row) return;
                          row.role = e.target.value;
                          setRoleChanges({ ...roleChanges, added: updated });
                        }}
                      />
                    </div>
                    <Select
                      value={role.seniority}
                      onValueChange={(value: Seniority) => {
                        const updated = [...roleChanges.added];
                        const row = updated[index];
                        if (!row) return;
                        row.seniority = value;
                        setRoleChanges({ ...roleChanges, added: updated });
                      }}
                    >
                      <SelectTrigger className="w-full xl:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={role.allocationType}
                      onValueChange={(value: "dedicated" | "parallel") => {
                        const updated = [...roleChanges.added];
                        const row = updated[index];
                        if (!row) return;
                        row.allocationType = value;
                        setRoleChanges({ ...roleChanges, added: updated });
                      }}
                    >
                      <SelectTrigger className="w-full xl:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dedicated">Dedicated</SelectItem>
                        <SelectItem value="parallel">Parallel</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Count"
                      className="w-full xl:w-24"
                      value={role.count}
                      onChange={(e) => {
                        const updated = [...roleChanges.added];
                        const row = updated[index];
                        if (!row) return;
                        row.count = parseInt(e.target.value) || 1;
                        setRoleChanges({ ...roleChanges, added: updated });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRoleChanges({
                          ...roleChanges,
                          added: roleChanges.added.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Remove Roles</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addRoleChange("removed")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Removal
                  </Button>
                </div>

                {roleChanges.removed.map((role, index) => (
                  <div key={index} className="flex flex-col xl:flex-row xl:items-end gap-2">
                    <Select
                      value={role.role}
                      onValueChange={(value) => {
                        const updated = [...roleChanges.removed];
                        const row = updated[index];
                        if (!row) return;
                        row.role = value;
                        const existing = project.teamComposition.find(t => t.role === value);
                        if (existing) {
                          row.seniority = existing.seniority;
                          row.allocationType = existing.allocationType;
                        }
                        setRoleChanges({ ...roleChanges, removed: updated });
                      }}
                    >
                      <SelectTrigger className="w-full xl:flex-1">
                        <SelectValue placeholder="Select role to remove" />
                      </SelectTrigger>
                      <SelectContent>
                        {project.teamComposition.map((tc) => (
                          <SelectItem key={`${tc.role}-${tc.seniority}`} value={tc.role}>
                            {tc.role} ({tc.seniority}) - {tc.allocationType} - {tc.count}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRoleChanges({
                          ...roleChanges,
                          removed: roleChanges.removed.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
                </>
              )}
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeEmployees"
                  checked={includeEmployees}
                  onCheckedChange={(checked) => setIncludeEmployees(Boolean(checked))}
                />
                <Label htmlFor="includeEmployees" className="flex items-center gap-2 text-base font-semibold">
                  <Users className="h-4 w-4" />
                  Team Members
                </Label>
              </div>
              {includeEmployees && (
                <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Add Team Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addEmployeeChange("added")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                </div>

                {employeeChanges.added.map((emp, index) => (
                  <div key={index} className="flex flex-col xl:flex-row xl:items-end gap-2">
                    <Select
                      value={emp.employeeId}
                      onValueChange={(value) => {
                        const updated = [...employeeChanges.added];
                        const employee = employees.find(e => e.id === value);
                        if (employee) {
                          updated[index] = {
                            employeeId: value,
                            role: employee.role,
                            seniority: employee.seniority,
                          };
                          setEmployeeChanges({ ...employeeChanges, added: updated });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full xl:flex-1">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEmployees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name} - {e.role} ({e.seniority})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEmployeeChanges({
                          ...employeeChanges,
                          added: employeeChanges.added.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Remove Team Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addEmployeeChange("removed")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Removal
                  </Button>
                </div>

                {employeeChanges.removed.map((emp, index) => (
                  <div key={index} className="flex flex-col xl:flex-row xl:items-end gap-2">
                    <Select
                      value={emp.employeeId}
                      onValueChange={(value) => {
                        const updated = [...employeeChanges.removed];
                        const member = project.assignedMembers?.find(m => m.employeeId === value);
                        if (member) {
                          updated[index] = {
                            employeeId: value,
                            role: member.role,
                            seniority: member.seniority,
                          };
                          setEmployeeChanges({ ...employeeChanges, removed: updated });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full xl:flex-1">
                        <SelectValue placeholder="Select team member to remove" />
                      </SelectTrigger>
                      <SelectContent>
                        {project.assignedMembers?.map((member) => {
                          const employee = employees.find(e => e.id === member.employeeId);
                          return (
                            <SelectItem key={member.id} value={member.employeeId}>
                              {employee?.name || "Unknown"} - {member.role}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEmployeeChanges({
                          ...employeeChanges,
                          removed: employeeChanges.removed.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Change Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

