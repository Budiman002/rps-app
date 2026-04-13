import { useState, useMemo } from "react";
import { formatDate } from "@/functions/dateFormatter";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import type { ContractExtensionRequest } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Calendar, CheckCircle2, XCircle, History } from "lucide-react";
import { toast } from "sonner";

export function EmployeeManagement() {
  const { user } = useAuth();
  const { employees, requestContractExtension, approveContractExtension, rejectContractExtension, getEmployeeExtensionHistory } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [newContractEndDate, setNewContractEndDate] = useState("");
  const [extensionReason, setExtensionReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"extend" | "request">("extend");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEmployeeId, setHistoryEmployeeId] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<ContractExtensionRequest[]>([]);
  const [historyFilter, setHistoryFilter] = useState<"approved" | "rejected">("approved");
  const [historyLoading, setHistoryLoading] = useState(false);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.FullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.JobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.Email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const historyEmployee = useMemo(() => {
    return historyEmployeeId ? employees.find(e => e.Id === historyEmployeeId) : null;
  }, [historyEmployeeId, employees]);

  const filteredHistoryItems = useMemo(() => {
    return historyItems.filter(item => item.Status?.toLowerCase() === historyFilter);
  }, [historyItems, historyFilter]);

  if (user?.role !== "HR" && user?.role !== "GM") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-4">Only HR and GM can access employee management</p>
      </div>
    );
  }

  const handleExtendContract = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    const employee = employees.find(e => e.Id === selectedEmployee);
    if (!employee?.ExtensionRequest) {
      toast.error("No extension request found");
      return;
    }

    try {
      await approveContractExtension(employee.ExtensionRequest.Id);
      toast.success("Contract extension approved");
      setDialogOpen(false);
      setSelectedEmployee(null);
      setNewContractEndDate("");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve contract extension");
    }
  };

  const handleRequestExtension = async () => {
    if (!selectedEmployee || !newContractEndDate || !extensionReason) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const employee = employees.find(e => e.Id === selectedEmployee);
      if (employee?.ContractEndDate) {
        const currentEndDate = new Date(employee.ContractEndDate);
        currentEndDate.setHours(0, 0, 0, 0);

        const newEndDate = new Date(newContractEndDate);
        newEndDate.setHours(0, 0, 0, 0);
        
        if (newEndDate <= currentEndDate) {
          toast.error("New end date should be in the future");
          return;
        }
      }

      await requestContractExtension(selectedEmployee, newContractEndDate, extensionReason);
      toast.success("Contract extension requested");
      setDialogOpen(false);
      setSelectedEmployee(null);
      setNewContractEndDate("");
      setExtensionReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to request contract extension");
    }
  };

  const handleRejectExtension = async (employeeId: string) => {
    const employee = employees.find(e => e.Id === employeeId);
    const requestId = employee?.ExtensionRequest?.Id;

    if (!requestId) {
      toast.error("No extension request found");
      return;
    }

    try {
      await rejectContractExtension(requestId);
      toast.info("Contract extension request rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject contract extension");
    }
  };

  const openExtendDialog = (employeeId: string, currentEndDate?: string) => {
    setSelectedEmployee(employeeId);
    setNewContractEndDate(currentEndDate || "");
    setDialogType("extend");
    setDialogOpen(true);
  };

  const openRequestDialog = (employeeId: string, currentEndDate?: string) => {
    setSelectedEmployee(employeeId);
    setNewContractEndDate(currentEndDate || "");
    setExtensionReason("");
    setDialogType("request");
    setDialogOpen(true);
  };

  const openHistoryDialog = async (employeeId: string) => {
    setHistoryEmployeeId(employeeId);
    setHistoryOpen(true);
    setHistoryFilter("approved");
    setHistoryLoading(true);

    try {
      const history = await getEmployeeExtensionHistory(employeeId);
      setHistoryItems(history);
    } catch (error: any) {
      toast.error(error.message || "Failed to load extension history");
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-gray-500 mt-1">Manage employee information and contracts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Permanent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {employees.filter(e => e.ContractType?.toLowerCase() === "permanent").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {employees.filter(e => e.ContractType?.toLowerCase() === "contract").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {employees.filter(e => e.IsUnavailable).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Employees</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search employees..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Contract Type</TableHead>
                  <TableHead>Contract Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Project</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.Id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.FullName}</div>
                          <div className="text-sm text-gray-500">{employee.Email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.JobTitle}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            employee.SeniorityLevel === "Senior" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            employee.SeniorityLevel === "Junior" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                            "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {employee.SeniorityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            employee.ContractType?.toLowerCase() === "permanent"
                               ? "bg-blue-50 text-blue-700 border-blue-200"
                               : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          {employee.ContractType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(employee.CreatedAt)}</div>
                          {employee.ContractEndDate && (
                            <div className="text-gray-400 mt-1">
                              to <span className="font-medium text-gray-700">{formatDate(employee.ContractEndDate)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.IsUnavailable ? "destructive" : "outline"} 
                          className={employee.IsUnavailable ? "" : "text-green-600 border-green-600"}
                        >
                          {employee.IsUnavailable ? "Unavailable" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {employee.CurrentProjects && employee.CurrentProjects.length > 0 ? (
                            employee.CurrentProjects.map((p, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 font-normal">
                                {p}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* GM Logic */}
                          {user?.role === "GM" &&
                            employee.ContractType?.toLowerCase() === "contract" && (
                              <>
                                {!employee.ExtensionRequest ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={employee.IsUnavailable}
                                    onClick={() =>
                                      openRequestDialog(employee.Id, employee.ContractEndDate)
                                    }
                                    className="gap-2"
                                  >
                                    <Calendar className="h-4 w-4" />
                                    Request Extension
                                  </Button>
                                ) : (
                                  <Badge
                                    variant={
                                      employee.ExtensionRequest.Status === "pending"
                                        ? "secondary"
                                        : employee.ExtensionRequest.Status === "approved"
                                        ? "default"
                                        : "destructive"
                                    }
                                    className="capitalize"
                                  >
                                    {employee.ExtensionRequest.Status}
                                  </Badge>
                                )}
                              </>
                            )}

                          {/* HR Logic */}
                          {user?.role === "HR" && (
                            <>
                              {employee.ContractType?.toLowerCase() === "permanent" ||
                              employee.IsUnavailable ? (
                                <Button
                                  size="sm"
                                  disabled
                                  variant="secondary"
                                  className="bg-gray-200 text-gray-500 cursor-not-allowed"
                                >
                                  Extend Locked
                                </Button>
                              ) : employee.ExtensionRequest?.Status?.toLowerCase() === "pending" ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      openExtendDialog(employee.Id, employee.ContractEndDate)
                                    }
                                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Extend
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectExtension(employee.Id)}
                                    className="gap-2"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openHistoryDialog(employee.Id)}
                                    className="gap-2"
                                  >
                                    <History className="h-4 w-4" />
                                    History
                                  </Button>
                                </>
                              ) : employee.ContractType?.toLowerCase() === "contract" ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-xs text-gray-400 italic">
                                    Awaiting GM Request
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openHistoryDialog(employee.Id)}
                                    className="gap-2"
                                  >
                                    <History className="h-4 w-4" />
                                    History
                                  </Button>
                                </div>
                              ) : null}
                            </>
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

      {/* Extend/Request Contract Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "extend" ? "Approve Contract Extension" : "Request Contract Extension"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "extend"
                ? "Review and approve the contract extension request"
                : "Request an extension for this employee's contract"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {dialogType === "extend" && selectedEmployee && (
              <>
                {(() => {
                  const employee = employees.find(e => e.Id === selectedEmployee);
                  if (!employee?.ExtensionRequest) return null;
                  return (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-xs text-gray-500">Requested By</Label>
                        <p className="font-medium">{employee.ExtensionRequest.RequestedBy || "Unknown"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Requested Date</Label>
                        <p className="font-medium">{formatDate(employee.ExtensionRequest.RequestedDate)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Proposed End Date</Label>
                        <p className="font-medium">{formatDate(employee.ExtensionRequest.ProposedEndDate)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Reason</Label>
                        <p className="text-sm">{employee.ExtensionRequest.Reason}</p>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
            {dialogType === "request" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="contractEndDate">New Contract End Date *</Label>
                  <Input
                    id="contractEndDate"
                    type="date"
                    value={newContractEndDate}
                    onChange={(e) => setNewContractEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Extension *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why this contract extension is needed..."
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={dialogType === "extend" ? handleExtendContract : handleRequestExtension}>
              {dialogType === "extend" ? "Approve Extension" : "Submit Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Extension History - {historyEmployee?.FullName}</DialogTitle>
            <DialogDescription>
              Showing only extension requests with final decisions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={historyFilter === "approved" ? "default" : "outline"}
                onClick={() => setHistoryFilter("approved")}
              >
                Extended
              </Button>
              <Button
                size="sm"
                variant={historyFilter === "rejected" ? "destructive" : "outline"}
                onClick={() => setHistoryFilter("rejected")}
              >
                Rejected
              </Button>
            </div>

            {historyLoading ? (
              <p className="text-sm text-gray-500">Loading history...</p>
            ) : filteredHistoryItems.length === 0 ? (
              <p className="text-sm text-gray-500">No {historyFilter} history found for this employee.</p>
            ) : (
              <div className="space-y-3">
                {filteredHistoryItems.map((item) => (
                  <div key={item.Id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={item.Status === "approved" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {item.Status === "approved" ? "Extended" : "Rejected"}
                      </Badge>
                      <span className="text-xs text-gray-500">Requested: {formatDate(item.RequestedDate)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Proposed End Date:</span>{" "}
                      <span className="font-medium">{formatDate(item.ProposedEndDate)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Reason:</span>{" "}
                      <span>{item.Reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

