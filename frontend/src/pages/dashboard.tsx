import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GanttChart } from "@/components/dashboard/gantt-chart";
import { GlobalSearch } from "@/components/search/global-search";
import { Plus, Edit, Eye, Users, X } from "lucide-react";
import { toast } from "sonner";

export function Dashboard() {
  const { user } = useAuth();
  const { projects, employees } = useData();
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const filteredProjects = useMemo(() => {
    if (!selectedEmployeeId) {
      return projects;
    }
    
    // Filter projects where the selected employee is either PM or team member
    return projects.filter(project => 
      project.assignedPmId === selectedEmployeeId || 
      project.members?.some(t => t.employeeId === selectedEmployeeId)
    );
  }, [projects, selectedEmployeeId]);

  const selectedEmployee = useMemo(() => {
    return selectedEmployeeId ? employees.find(e => e.id === selectedEmployeeId) : null;
  }, [selectedEmployeeId, employees]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      unassigned: projects.filter(p => p.status === "unassigned").length,
      scheduled: projects.filter(p => p.status === "scheduled").length,
      inProgress: projects.filter(p => p.status === "in-progress").length,
      completed: projects.filter(p => p.status === "completed").length,
    };
  }, [projects]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all projects across your organization
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Unassigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.unassigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <GanttChart projects={projects} />

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <CardTitle>
                {selectedEmployee ? `Projects - ${selectedEmployee.fullName}` : "All Projects"}
              </CardTitle>
              {selectedEmployee && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmployeeId("")}
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear Filter
                </Button>
              )}
            </div>
            <GlobalSearch
              onEmployeeSelect={setSelectedEmployeeId}
              placeholder="Search projects or employees..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.clientName}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>{getPriorityBadge(project.priority)}</TableCell>
                      <TableCell>
                        {project.actualStartDate || project.expectedStartDate || "-"}
                      </TableCell>
                      <TableCell>
                        {project.endDate || project.estimatedEndDate || "-"}
                      </TableCell>
                      <TableCell>{project.durationWeeks}w</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>
                            {project.members?.length || 0}/
                            {project.roleCompositions.reduce((sum, t) => sum + t.quantity, 0)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {project.updatedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/app/projects/${project.id}`, { state: { from: '/app/dashboard' } })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user?.role === "GM" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/app/projects/${project.id}/edit`, { state: { from: '/app/dashboard' } })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

