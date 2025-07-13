import React, { useState, useEffect } from "react";
import { useProject, Task, TaskStatus, TaskPriority } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import AddTaskDialog from "@/components/kanban/AddTaskDialog";
import InviteMemberDialog from "@/components/kanban/InviteMemberDialog";
import TaskFilter from "@/components/kanban/TaskFilter";
import TaskStatistics from "@/components/kanban/TaskStatistics";
import { format } from "date-fns";

const KanbanBoard = () => {
  const { currentProject, updateTask, loadTasks } = useProject();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (currentProject) {
      loadTasks(currentProject.id);
    }
  }, [currentProject, loadTasks]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground">
            Please select a project from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  // Get all unique tags from tasks
  const availableTags = Array.from(
    new Set(currentProject.tasks.flatMap((task) => task.tags))
  );

  // Filter tasks based on search term, priorities, and tags
  const filteredTasks = currentProject.tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
    return matchesSearch && matchesPriority && matchesTags;
  });

  // Group tasks by status
  const columns: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    "in-progress": [],
    review: [],
    completed: [],
  };

  filteredTasks.forEach((task) => {
    columns[task.status].push(task);
  });

  const columnTitles: Record<TaskStatus, string> = {
    backlog: "Backlog",
    todo: "To Do",
    "in-progress": "In Progress",
    review: "Review",
    completed: "Completed",
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      await updateTask(draggedTask.id, { status });
      toast({
        title: "Task updated",
        description: `Task moved to ${columnTitles[status]}`,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentProject.name}</h1>
          <p className="text-muted-foreground">{currentProject.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <InviteMemberDialog projectId={currentProject.id} />
          <AddTaskDialog projectId={currentProject.id} />
        </div>
      </div>

      {/* Task Statistics */}
      <TaskStatistics tasks={currentProject.tasks} />
      
      {/* Task Filters */}
      <TaskFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
      />

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {Object.keys(columns).map((status) => (
          <div
            key={status}
            className="flex flex-col"
            onDrop={(e) => handleDrop(e, status as TaskStatus)}
            onDragOver={handleDragOver}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{columnTitles[status as TaskStatus]}</h3>
              <Badge variant="secondary">{columns[status as TaskStatus].length}</Badge>
            </div>
            <div className="flex-1 space-y-2 min-h-[200px] p-2 bg-muted/50 rounded-lg">
              {columns[status as TaskStatus].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className="mb-2 cursor-grab active:cursor-grabbing"
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card 
                        className="hover:border-primary transition-colors" 
                        onClick={() => setSelectedTask(task)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center mb-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-2`} />
                            <span className="text-xs font-medium uppercase">
                              {task.priority}
                            </span>
                            {new Date(task.dueDate) < new Date() && task.status !== "completed" && (
                              <div className="ml-auto flex items-center text-xs text-destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Overdue
                              </div>
                            )}
                          </div>
                          
                          <h4 className="font-medium mb-2">{task.title}</h4>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {task.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {task.assigneeId && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={currentProject.members.find(m => m.id === task.assigneeId)?.avatarUrl}
                                    alt={currentProject.members.find(m => m.id === task.assigneeId)?.name}
                                  />
                                  <AvatarFallback>
                                    {currentProject.members.find(m => m.id === task.assigneeId)?.name
                                      .split(" ")
                                      .map(n => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>{task.title}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-2`} />
                            <span className="text-xs font-medium uppercase">
                              {task.priority} Priority
                            </span>
                          </div>
                          
                          <div className="text-xs bg-muted px-2 py-1 rounded-full">
                            {columnTitles[task.status]}
                          </div>
                          
                          <div className="text-xs">
                            Due: {formatDate(task.dueDate)}
                          </div>
                        </div>
                        
                        <div className="prose prose-sm max-w-none">
                          <p>{task.description}</p>
                        </div>

                        {task.tags.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {task.assigneeId && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Assigned to</h4>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={currentProject.members.find(m => m.id === task.assigneeId)?.avatarUrl}
                                  alt={currentProject.members.find(m => m.id === task.assigneeId)?.name}
                                />
                                <AvatarFallback>
                                  {currentProject.members.find(m => m.id === task.assigneeId)?.name
                                    .split(" ")
                                    .map(n => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {currentProject.members.find(m => m.id === task.assigneeId)?.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
