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
import { Eye, Users, AlertCircle, X, FileEdit } from "lucide-react";

export function PMDashboard() {
  const { user } = useAuth();
  const { projects, employees } = useData();
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  // Get current PM's employee ID
  const pmEmployee = employees.find(e => e.email === user?.email);

  // Filter projects where the PM is assigned
  const myProjects = useMemo(() => {
    return projects.filter(project => 
      project.pmId === pmEmployee?.id && 
      project.status !== "unassigned"
    );
  }, [projects, pmEmployee]);

  const filteredProjects = useMemo(() => {
    if (!selectedEmployeeId) {
      return myProjects;
    }
    
    // Filter by employee in team (since PM is already filtered)
    return myProjects.filter(project =>
      project.assignedMembers?.some(t => t.employeeId === selectedEmployeeId)
    );
  }, [myProjects, selectedEmployeeId]);

  const selectedEmployee = useMemo(() => {
    return selectedEmployeeId ? employees.find(e => e.id === selectedEmployeeId) : null;
  }, [selectedEmployeeId, employees]);

  const stats = useMemo(() => {
    return {
      total: myProjects.length,
      scheduled: myProjects.filter(p => p.status === "scheduled").length,
      inProgress: myProjects.filter(p => p.status === "in-progress").length,
      completed: myProjects.filter(p => p.status === "completed").length,
      pending: myProjects.reduce((sum, p) => sum + (p.requestChanges?.filter(r => r.status === "pending").length || 0), 0),
    };
  }, [myProjects]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Project Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Track and manage your assigned projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">My Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <GanttChart projects={myProjects} />

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <CardTitle>
                {selectedEmployee ? `Projects - ${selectedEmployee.name}` : "My Projects"}
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
              placeholder="Search projects or team members..."
            />
          </div>
        </CardHeader>
        <CardContent>
          {myProjects.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Assigned</h3>
              <p className="text-gray-500">You haven't been assigned to any projects yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Request Change Status</TableHead>
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
                    filteredProjects.map((project) => {
                      const pendingRequests = project.requestChanges?.filter(r => r.status === "pending").length || 0;
                      const hasRequests = (project.requestChanges?.length || 0) > 0;
                      const canRequestChange = project.status === "scheduled" || project.status === "in-progress";

                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell>{getStatusBadge(project.status)}</TableCell>
                          <TableCell>
                            {project.startDate || project.expectedStartDate || "-"}
                          </TableCell>
                          <TableCell>
                            {project.endDate || project.estimatedEndDate || "-"}
                          </TableCell>
                          <TableCell>{project.duration}w</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>
                                {project.assignedMembers?.length || 0}/
                                {project.teamComposition.reduce((sum, t) => sum + t.count, 0)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {hasRequests ? (
                              <div className="flex items-center gap-2">
                                <Badge variant={pendingRequests > 0 ? "secondary" : "outline"}>
                                  {pendingRequests > 0 ? `${pendingRequests} Pending` : "No Pending"}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {project.lastUpdated}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canRequestChange && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    navigate(`/app/projects/${project.id}`, {
                                      state: {
                                        from: "/app/pm-dashboard",
                                        openRequestModal: true,
                                      },
                                    })
                                  }
                                  title="Request Change"
                                >
                                  <FileEdit className="h-4 w-4 text-orange-600" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigate(`/app/projects/${project.id}`, { state: { from: '/app/pm-dashboard' } })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}