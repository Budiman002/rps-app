import { useMemo } from "react";
import { Project } from "@/contexts/data-context";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface GanttChartProps {
  projects: Project[];
}

export function GanttChart({ projects }: GanttChartProps) {
  const { timeline, monthHeaders } = useMemo(() => {
    // Filter projects with dates
    const projectsWithDates = projects.filter(p => 
      (p.ActualStartDate || p.ExpectedStartDate) && 
      (p.EndDate || p.EstimatedEndDate)
    );
    
    if (projectsWithDates.length === 0) {
      return { timeline: [], monthHeaders: [] };
    }

    // Find min and max dates
    const allDates = projectsWithDates.flatMap(p => [
      new Date(p.ActualStartDate || p.ExpectedStartDate!),
      new Date(p.EndDate || p.EstimatedEndDate!),
    ]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Extend range to start/end of months
    const startDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

    // Generate month headers
    const months: Array<{ label: string; days: number }> = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      months.push({
        label: current.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        days: daysInMonth,
      });
      
      current.setMonth(current.getMonth() + 1);
    }

    // Calculate total days
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Create timeline bars
    const timeline = projectsWithDates.map(project => {
      const projectStart = new Date(project.ActualStartDate || project.ExpectedStartDate!);
      const projectEnd = new Date(project.EndDate || project.EstimatedEndDate!);
      
      const startOffset = Math.ceil((projectStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const duration = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const leftPercent = (startOffset / totalDays) * 100;
      const widthPercent = (duration / totalDays) * 100;

      return {
        project,
        leftPercent,
        widthPercent,
      };
    });

    return { timeline, monthHeaders: months };
  }, [projects]);

  if (timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            No projects with scheduled dates
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-slate-400";
      case "InProgress":
        return "bg-blue-500";
      case "Complete":
        return "bg-emerald-500";
      default:
        return "bg-zinc-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month headers */}
            <div className="flex border-b border-gray-200 mb-4 pb-2">
              {monthHeaders.map((month, idx) => (
                <div
                  key={idx}
                  className="text-xs font-medium text-gray-600 text-center"
                  style={{ width: `${(month.days / monthHeaders.reduce((sum, m) => sum + m.days, 0)) * 100}%` }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            {/* Timeline bars */}
            <div className="space-y-3">
              {timeline.map(({ project, leftPercent, widthPercent }) => (
                <div key={project.Id} className="relative">
                  <div className="flex items-center mb-1">
                    <div className="w-48 flex-shrink-0 pr-4">
                      <div className="text-sm font-medium truncate">{project.Name}</div>
                      <div className="text-xs text-gray-500 truncate">{project.ClientName}</div>
                    </div>
                    <div className="flex-1 relative h-8 bg-gray-100 rounded">
                      <div
                        className={`absolute h-full ${getStatusColor(project.Status)} rounded flex items-center justify-center transition-all`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                      >
                        <span className="text-xs text-white font-medium px-2 truncate">
                          {project.DurationWeeks}w
                        </span>
                      </div>
                    </div>
                    <div className="w-32 flex-shrink-0 pl-4">
                      <Badge
                        variant={project.Status === "InProgress" || project.Status === "Scheduled" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {project.Status === "InProgress" ? "In Progress" : project.Status === "Scheduled" ? "Scheduled" : project.Status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-400 rounded"></div>
                <span className="text-xs text-gray-600">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-300 rounded"></div>
                <span className="text-xs text-gray-600">Unassigned</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
