import React, { useState, useEffect } from "react";
import { useProject, Task, TaskStatus, TaskPriority } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import AddTaskDialog from "@/components/kanban/AddTaskDialog";
import TaskFilter from "@/components/kanban/TaskFilter";
import TaskStatistics from "@/components/kanban/TaskStatistics";

const KanbanBoard = () => {
  const { currentProject, updateTaskStatus, projects } = useProject();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  // If no project is selected, use the first project
  const project = currentProject || (projects.length > 0 ? projects[0] : null);
  
  // Get all unique tags from all tasks
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  useEffect(() => {
    if (project) {
      const allTags = project.tasks.flatMap(task => task.tags);
      const uniqueTags = Array.from(new Set(allTags));
      setAvailableTags(uniqueTags);
    }
  }, [project]);
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground">
            Please select a project from the sidebar to view the Kanban board.
          </p>
        </div>
      </div>
    );
  }

  // Filter tasks based on search term and filters
  const filteredTasks = project.tasks.filter(task => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Priority filter
    const matchesPriority = selectedPriorities.length === 0 || 
      selectedPriorities.includes(task.priority);
    
    // Tags filter
    const matchesTags = selectedTags.length === 0 || 
      task.tags.some(tag => selectedTags.includes(tag));
    
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

  const columnColors: Record<TaskStatus, string> = {
    backlog: "bg-slate-200 dark:bg-slate-800",
    todo: "bg-blue-100 dark:bg-blue-900/30",
    "in-progress": "bg-amber-100 dark:bg-amber-900/30",
    review: "bg-purple-100 dark:bg-purple-900/30",
    completed: "bg-green-100 dark:bg-green-900/30",
  };

  const getPriorityColor = (priority: string): string => {
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData("taskId", task.id);
    
    // Add a nice visual effect
    if (e.target instanceof HTMLElement) {
      setTimeout(() => {
        if (e.target instanceof HTMLElement) {
          e.target.style.opacity = "0.4";
        }
      }, 0);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset opacity
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.target instanceof HTMLElement) {
      e.target.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.backgroundColor = "";
    }
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    
    // Reset any styling
    if (e.target instanceof HTMLElement) {
      e.target.style.backgroundColor = "";
    }
    
    const taskId = e.dataTransfer.getData("taskId");
    
    if (taskId && draggedTask && draggedTask.status !== status) {
      // Update the task status
      updateTaskStatus(project.id, taskId, status);
      
      toast({
        title: "Task updated",
        description: `Task moved to ${columnTitles[status]}`,
      });
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <AddTaskDialog projectId={project.id} />
      </div>

      {/* Task Statistics */}
      <TaskStatistics tasks={project.tasks} />
      
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[calc(100vh-350px)]">
        {Object.keys(columns).map((status) => (
          <div key={status} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{columnTitles[status as TaskStatus]}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {columns[status as TaskStatus].length}
              </span>
            </div>
            
            <div
              className={`flex-1 ${columnColors[status as TaskStatus]} rounded-md p-2 overflow-y-auto`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status as TaskStatus)}
            >
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
                          
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {task.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{task.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {formatDate(task.dueDate)}
                            </div>
                            
                            {task.assigneeId && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage 
                                  src={project.members.find(m => m.id === task.assigneeId)?.avatarUrl} 
                                  alt={project.members.find(m => m.id === task.assigneeId)?.name || ""} 
                                />
                                <AvatarFallback>
                                  {getInitials(project.members.find(m => m.id === task.assigneeId)?.name || "")}
                                </AvatarFallback>
                              </Avatar>
                            )}
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
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.description || "No description provided."}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Assigned To</h4>
                            {task.assigneeId ? (
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage 
                                    src={project.members.find(m => m.id === task.assigneeId)?.avatarUrl} 
                                    alt={project.members.find(m => m.id === task.assigneeId)?.name || ""} 
                                  />
                                  <AvatarFallback>
                                    {getInitials(project.members.find(m => m.id === task.assigneeId)?.name || "")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {project.members.find(m => m.id === task.assigneeId)?.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Not assigned
                              </span>
                            )}
                          </div>
                          
                          {task.tags.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {task.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="px-2 py-1 text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Comments</h4>
                            <Separator className="mb-3" />
                            
                            {task.comments.length > 0 ? (
                              <div className="space-y-3">
                                {task.comments.map((comment) => (
                                  <div key={comment.id} className="pb-3">
                                    <div className="flex items-center mb-1">
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage 
                                          src={project.members.find(m => m.id === comment.userId)?.avatarUrl} 
                                          alt={project.members.find(m => m.id === comment.userId)?.name || ""} 
                                        />
                                        <AvatarFallback>
                                          {getInitials(project.members.find(m => m.id === comment.userId)?.name || "")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium">
                                        {project.members.find(m => m.id === comment.userId)?.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {new Date(comment.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm pl-8">{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No comments yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
              
              {columns[status as TaskStatus].length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground italic">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
