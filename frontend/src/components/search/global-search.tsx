import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../ui/input";
import { Search, FolderKanban, User, X } from "lucide-react";
import { useData } from "@/contexts/data-context";
import { Badge } from "../ui/badge";

interface GlobalSearchProps {
  onEmployeeSelect?: (employeeId: string) => void;
  placeholder?: string;
}

export function GlobalSearch({ onEmployeeSelect, placeholder = "Search projects or employees..." }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { projects, employees } = useData();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { projects: [], employees: [] };

    const lowerQuery = query.toLowerCase();

    // Search projects
    const matchingProjects = projects.filter(
      (project) =>
        project.Name.toLowerCase().includes(lowerQuery) ||
        project.ClientName.toLowerCase().includes(lowerQuery)
    );

    // Search employees
    const matchingEmployees = employees.filter(
      (employee) =>
        employee.FullName.toLowerCase().includes(lowerQuery) ||
        employee.Email.toLowerCase().includes(lowerQuery) ||
        employee.JobTitle.toLowerCase().includes(lowerQuery)
    );

    return {
      projects: matchingProjects.slice(0, 5),
      employees: matchingEmployees.slice(0, 5),
    };
  }, [query, projects, employees]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/app/projects/${projectId}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleEmployeeClick = (employeeId: string) => {
    if (onEmployeeSelect) {
      onEmployeeSelect(employeeId);
      setQuery("");
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    if (onEmployeeSelect) {
      onEmployeeSelect("");
    }
  };

  const hasResults = searchResults.projects.length > 0 || searchResults.employees.length > 0;
  const showDropdown = isOpen && query.trim() && hasResults;

  // Get employee projects count
  const getEmployeeProjectCount = (employeeId: string) => {
    return projects.filter(
      (p) => p.AssignedPmId === employeeId || p.Members?.some((m) => m.EmployeeId === employeeId)
    ).length;
  };

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Projects Section */}
          {searchResults.projects.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                Projects ({searchResults.projects.length})
              </div>
              {searchResults.projects.map((project) => (
                <button
                  key={project.Id}
                  onClick={() => handleProjectClick(project.Id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-start gap-3 transition-colors"
                >
                  <FolderKanban className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{project.Name}</div>
                    <div className="text-xs text-gray-500 truncate">{project.ClientName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {project.Status === "Scheduled" && (
                        <Badge className="bg-purple-500 text-xs text-white">Scheduled</Badge>
                      )}
                      {project.Status === "InProgress" && (
                        <Badge className="bg-blue-500 text-xs text-white">In Progress</Badge>
                      )}
                      {project.Status === "Complete" && (
                        <Badge className="bg-green-500 text-xs text-white">Completed</Badge>
                      )}
                      {project.Status === "Unassigned" && (
                        <Badge variant="secondary" className="text-xs">Unassigned</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Employees Section */}
          {searchResults.employees.length > 0 && (
            <div className="p-2 border-t">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                Employees ({searchResults.employees.length})
              </div>
              {searchResults.employees.map((employee) => {
                const projectCount = getEmployeeProjectCount(employee.Id);
                return (
                  <button
                    key={employee.Id}
                    onClick={() => handleEmployeeClick(employee.Id)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md flex items-start gap-3 transition-colors"
                  >
                    <User className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{employee.FullName}</div>
                      <div className="text-xs text-gray-500 truncate">{employee.Email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {employee.JobTitle}
                        </Badge>
                        {projectCount > 0 && (
                          <span className="text-xs text-gray-500">
                            {projectCount} {projectCount === 1 ? "project" : "projects"}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!hasResults && query.trim() && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No projects or employees found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
