import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { Project, useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Users, UserPlus, FileEdit, Eye, History } from "lucide-react";
import { ChangeRequestsSection } from "@/components/project-change-requests/change-requests-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProjectManagement() {
  const { user } = useAuth();
  const { projects, employees } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectIdForHistory, setSelectedProjectIdForHistory] = useState<string | null>(null);

  const selectedProjectForHistory = projects.find(p => p.Id === selectedProjectIdForHistory);

  // Filter projects logic
  const allProjects = projects;
  const unassignedProjects = projects.filter(p => p.Status === "Unassigned");

  const filteredAllProjects = useMemo(() => {
    return allProjects.filter(project =>
      project.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.ClientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProjects, searchQuery]);

  const filteredUnassignedProjects = useMemo(() => {
    return unassignedProjects.filter(project =>
      project.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.ClientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [unassignedProjects, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Badge className="bg-slate-400">Scheduled</Badge>;
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderProjectRow = (project: Project, showAssignButton = false) => (
    <TableRow key={project.Id}>
      <TableCell
        className="font-medium cursor-pointer hover:text-blue-600"
        onClick={() => navigate(`/app/projects/${project.Id}`, { state: { from: '/app/projects' } })}
      >
        {project.Name}
      </TableCell>
      <TableCell>{project.ClientName}</TableCell>
      <TableCell>{getStatusBadge(project.Status)}</TableCell>
      <TableCell>
        {formatDate(project.ActualStartDate || project.ExpectedStartDate)} - {formatDate(project.EndDate || project.EstimatedEndDate)}
      </TableCell>
      <TableCell>{project.DurationWeeks}w</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>
            {project.Members?.length || 0}/
            {project.RoleCompositions?.reduce((sum, t) => sum + t.Quantity, 0) || 0}
          </span>
        </div>
      </TableCell>
      {(user?.role === "GM" || user?.role === "Marketing") && (
        <TableCell>
          {project.RequestChanges && project.RequestChanges.filter((r) => r.Status === "pending").length > 0 ? (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {project.RequestChanges.filter((r) => r.Status === "pending").length} Pending
            </Badge>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </TableCell>
      )}
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {showAssignButton && user?.role === "GM" ? (
            <Button
              size="sm"
              onClick={() => navigate(`/app/projects/${project.Id}/assign`, { state: { from: '/app/projects' } })}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>
          ) : (
            <>
              {user?.role === "PM" && (project.Status === "Scheduled" || project.Status === "InProgress") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    navigate(`/app/projects/${project.Id}`, {
                      state: {
                        from: "/app/projects",
                        openRequestModal: true,
                      },
                    })
                  }
                  title="Request Change"
                >
                  <FileEdit className="h-4 w-4 text-orange-600" />
                </Button>
              )}
              {user?.role === "PM" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProjectIdForHistory(project.Id)}
                  title="View Request History"
                >
                  <History className="h-4 w-4 text-blue-600" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/app/projects/${project.Id}`, { state: { from: '/app/projects' } })}
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {user?.role === "GM" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/app/projects/${project.Id}/edit`, { state: { from: '/app/projects' } })}
                  title="Edit Project"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === "PM" ? "My Projects" : "Project Management"}
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.role === "PM" 
              ? "View and manage your assigned projects"
              : "Manage all projects and assignments"}
          </p>
          {user?.role === "PM" && (
            <div className="relative mt-4 w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search my projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>
        {user?.role === "Marketing" && (
          <Button onClick={() => navigate("/app/projects/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          {user?.role === "GM" && (
            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>
                  {user?.role === "PM" ? "My Projects" : "All Projects"}
                </CardTitle>
                {user?.role !== "PM" && (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                )}
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
                      <TableHead>Start - End Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Team Members</TableHead>
                      {(user?.role === "GM" || user?.role === "Marketing") && (
                        <TableHead>Requests</TableHead>
                      )}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAllProjects.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={user?.role === "PM" ? 7 : 8} 
                          className="text-center py-8 text-gray-500"
                        >
                          No projects found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAllProjects.map(project => renderProjectRow(project))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "GM" && (
          <TabsContent value="unassigned" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Unassigned Projects</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
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
                        <TableHead>Start - End Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Team Members</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnassignedProjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No unassigned projects
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnassignedProjects.map(project => renderProjectRow(project, true))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Request History Dialog */}
      <Dialog open={!!selectedProjectIdForHistory} onOpenChange={(open) => !open && setSelectedProjectIdForHistory(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request History - {selectedProjectForHistory?.Name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ChangeRequestsSection 
              requests={selectedProjectForHistory?.RequestChanges || []} 
              employees={employees}
              canManage={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
