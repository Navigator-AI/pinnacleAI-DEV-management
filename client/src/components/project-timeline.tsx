import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { differenceInDays } from "date-fns";
import type { Task } from "@shared/schema";

interface ProjectTimelineProps {
  tasks: Task[];
}

export function ProjectTimeline({ tasks }: ProjectTimelineProps) {
  const data = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    // Filter tasks with both start and due dates
    const tasksWithDates = tasks.filter(t => t.startDate && t.dueDate);
    
    if (tasksWithDates.length === 0) return [];

    // Find project start
    const projectStart = new Date(Math.min(...tasksWithDates.map(t => new Date(t.startDate!).getTime())));
    
    return tasksWithDates.map(task => {
      const start = new Date(task.startDate!);
      const end = new Date(task.dueDate!);
      const duration = differenceInDays(end, start) + 1;
      const offset = differenceInDays(start, projectStart);

      return {
        name: task.title,
        start: offset,
        duration: duration,
        status: task.status,
        priority: task.priority
      };
    }).sort((a, b) => a.start - b.start);
  }, [tasks]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-md text-muted-foreground">
        <p>No tasks with start and due dates found to display in timeline.</p>
        <p className="text-sm">Add start and due dates to your tasks to see them here.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "hsl(var(--primary))";
      case "review": return "hsl(var(--chart-2))";
      case "in-progress": return "hsl(var(--chart-1))";
      default: return "hsl(var(--muted-foreground))";
    }
  };

  return (
    <div className="h-[450px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={120} 
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const task = payload[0].payload;
                return (
                  <div className="bg-background border rounded-md shadow-md p-3 text-xs space-y-1">
                    <p className="font-bold text-sm mb-1">{task.name}</p>
                    <p><span className="text-muted-foreground">Status:</span> <span className="capitalize font-medium">{task.status}</span></p>
                    <p><span className="text-muted-foreground">Priority:</span> <span className="capitalize font-medium">{task.priority}</span></p>
                    <p><span className="text-muted-foreground">Duration:</span> <span className="font-medium">{task.duration} days</span></p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="start" stackId="a" fill="transparent" />
          <Bar dataKey="duration" stackId="a" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
