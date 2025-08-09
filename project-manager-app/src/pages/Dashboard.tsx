import React from "react";
import { useProject } from "@/contexts/ProjectContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, PlusCircle } from "lucide-react";
import { TaskStatus, Task } from "@/contexts/ProjectContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Dashboard = () => {
  const { projects, currentUser, setCurrentProject, createProject } = useProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#6366f1"); // default color
  const colorOptions = [
    "#6366f1", // indigo
    "#f59e42", // orange
    "#10b981", // green
    "#ef4444", // red
    "#fbbf24", // yellow
    "#3b82f6", // blue
    "#a855f7", // purple
  ];
  const { addToast } = useToast();
  const toast = addToast;
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  // Get all tasks from all projects
  const allTasks = projects.flatMap((project) => project.tasks);

  // Get tasks assigned to current user (by email, not id)
  const userTasks = allTasks.filter((task) => {
    // Find the project this task belongs to
    const project = projects.find((p) => p.tasks.some((t) => t.id === task.id));
    if (!project) return false;
    // Find the member assigned to this task
    const member = project.members.find((m) => m.id === task.assigneeId);
    return member?.email === currentUser.email;
  });

  // Helper to compare only the date part (ignoring time)
  const isOverdue = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };
  const isUpcoming = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    return due >= today && due <= in7Days;
  };

  // Calculate various metrics
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(
    (task) => task.status === "completed"
  ).length;

  const upcomingTasks = userTasks.filter(
    (task) => isUpcoming(task.dueDate) && task.status !== "completed"
  );

  const overdueTasks = userTasks.filter(
    (task) => isOverdue(task.dueDate) && task.status !== "completed"
  );

  // Calculate completion percentage
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by status for chart data
  const tasksByStatus = allTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  const getStatusColor = (status: TaskStatus): string => {
    const colors: Record<TaskStatus, string> = {
      backlog: "text-muted-foreground",
      todo: "text-blue-500",
      "in-progress": "text-amber-500",
      review: "text-purple-500",
      completed: "text-green-500",
    };
    return colors[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center p-3 rounded-md border mb-2 hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium">{task.title}</h4>
        <div className="flex items-center mt-1">
          <span className={`text-xs ${getStatusColor(task.status)}`}>
            {task.status
              .replace("-", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
          <span className="text-xs text-muted-foreground mx-2">•</span>
          <span className="text-xs text-muted-foreground">
            Due {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
      <div
        className={`w-2 h-2 rounded-full ${
          task.priority === "high" || task.priority === "urgent"
            ? "bg-red-500"
            : task.priority === "medium"
            ? "bg-yellow-500"
            : "bg-blue-500"
        }`}
      />
    </div>
  );

  const handleNewProjectSubmit = async () => {
    if (!newProjectName.trim()) {
      setErrorDialog({ open: true, message: "Project name is required." });
      return;
    }
    if (!newProjectDescription.trim()) {
      setErrorDialog({ open: true, message: "Project description is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const newProject = await createProject({
        name: newProjectName,
        description: newProjectDescription,
        color: newProjectColor,
        members: [],
        tasks: [],
      });
      toast({
        title: "Project Created",
        description: `Project '${newProject.name}' was created successfully.`,
      });
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectColor("#6366f1");
      setIsNewProjectDialogOpen(false);
    } catch (err: any) {
      console.error("Error (MongoDB Atlas) creating new project:", err);
      setErrorDialog({ open: true, message: err?.message || "Failed to create new project (MongoDB Atlas)." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Error Dialog */}
      {errorDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
              onClick={() => setErrorDialog({ open: false, message: "" })}
              aria-label="Close error dialog"
            >
              ×
            </button>
            <div className="text-lg font-semibold mb-2 text-red-600">Error</div>
            <div className="text-gray-800">{errorDialog.message}</div>
          </div>
        </div>
      )}
      <div className="p-6 h-full overflow-auto">
        {/* ...existing code... */}
      </div>
    </>
  );
};

export default Dashboard;
