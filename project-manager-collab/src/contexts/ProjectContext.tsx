import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import * as api from "@/services/api";

// Define types for our data structures
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string | null;
  creatorId: string;
  attachments: string[];
  comments: Comment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

// Sample data for development
const sampleUsers: User[] = [
  {
    id: "user-1",
    name: "Jane Smith",
    email: "jane@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=jane",
  },
  {
    id: "user-2",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=john",
  },
  {
    id: "user-3",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    id: "user-4",
    name: "Michael Brown",
    email: "michael@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=michael",
  },
];

const sampleProjects: Project[] = [
  {
    id: "project-1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website with new branding",
    tasks: [
      {
        id: "task-1",
        title: "Design Homepage Mockup",
        description: "Create wireframes and visual designs for the new homepage",
        status: "completed",
        priority: "high",
        dueDate: "2025-04-15",
        assigneeId: "user-1",
        creatorId: "user-2",
        attachments: [],
        comments: [
          {
            id: "comment-1",
            content: "The initial designs look great!",
            userId: "user-2",
            createdAt: "2025-04-01T10:30:00Z",
          },
        ],
        tags: ["design", "homepage"],
        createdAt: "2025-03-28T09:00:00Z",
        updatedAt: "2025-04-02T11:20:00Z",
      },
      {
        id: "task-2",
        title: "Implement Frontend Components",
        description: "Code the React components based on the approved designs",
        status: "in-progress",
        priority: "medium",
        dueDate: "2025-04-25",
        assigneeId: "user-3",
        creatorId: "user-2",
        attachments: [],
        comments: [],
        tags: ["frontend", "react"],
        createdAt: "2025-04-03T14:20:00Z",
        updatedAt: "2025-04-03T14:20:00Z",
      },
      {
        id: "task-3",
        title: "Set Up CI/CD Pipeline",
        description: "Configure GitHub Actions for automated testing and deployment",
        status: "todo",
        priority: "medium",
        dueDate: "2025-04-20",
        assigneeId: "user-4",
        creatorId: "user-2",
        attachments: [],
        comments: [],
        tags: ["devops", "automation"],
        createdAt: "2025-04-05T11:10:00Z",
        updatedAt: "2025-04-05T11:10:00Z",
      },
      {
        id: "task-4",
        title: "Content Migration Strategy",
        description: "Plan the migration of existing content to the new site structure",
        status: "backlog",
        priority: "low",
        dueDate: "2025-05-01",
        assigneeId: null,
        creatorId: "user-1",
        attachments: [],
        comments: [],
        tags: ["content", "migration"],
        createdAt: "2025-04-06T09:15:00Z",
        updatedAt: "2025-04-06T09:15:00Z",
      },
      {
        id: "task-5",
        title: "SEO Optimization",
        description: "Implement SEO best practices across the new site",
        status: "todo",
        priority: "high",
        dueDate: "2025-04-28",
        assigneeId: "user-1",
        creatorId: "user-2",
        attachments: [],
        comments: [],
        tags: ["seo", "marketing"],
        createdAt: "2025-04-07T13:45:00Z",
        updatedAt: "2025-04-07T13:45:00Z",
      },
    ],
    members: [
      {
        ...sampleUsers[0],
        role: "admin",
      },
      {
        ...sampleUsers[1],
        role: "admin",
      },
      {
        ...sampleUsers[2],
        role: "member",
      },
      {
        ...sampleUsers[3],
        role: "member",
      },
    ],
    createdAt: "2025-03-25T08:00:00Z",
    updatedAt: "2025-04-07T13:45:00Z",
  },
  {
    id: "project-2",
    name: "Mobile App Development",
    description: "Building a new mobile app for customer engagement",
    tasks: [
      {
        id: "task-6",
        title: "User Authentication Flow",
        description: "Implement secure login and registration functionality",
        status: "in-progress",
        priority: "high",
        dueDate: "2025-04-20",
        assigneeId: "user-3",
        creatorId: "user-1",
        attachments: [],
        comments: [],
        tags: ["authentication", "security"],
        createdAt: "2025-04-01T10:00:00Z",
        updatedAt: "2025-04-05T15:30:00Z",
      },
      {
        id: "task-7",
        title: "UI Component Library",
        description: "Create reusable UI components for the app",
        status: "todo",
        priority: "medium",
        dueDate: "2025-04-22",
        assigneeId: "user-2",
        creatorId: "user-1",
        attachments: [],
        comments: [],
        tags: ["ui", "components"],
        createdAt: "2025-04-03T11:20:00Z",
        updatedAt: "2025-04-03T11:20:00Z",
      },
    ],
    members: [
      {
        ...sampleUsers[0],
        role: "admin",
      },
      {
        ...sampleUsers[1],
        role: "member",
      },
      {
        ...sampleUsers[2],
        role: "member",
      },
    ],
    createdAt: "2025-03-30T09:15:00Z",
    updatedAt: "2025-04-05T15:30:00Z",
  },
];

interface ProjectContextProps {
  currentUser: User;
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  createTask: (projectId: string, task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: TaskStatus) => void;
  addComment: (projectId: string, taskId: string, content: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // For demo purposes, we'll use a fixed current user
  const currentUser: User = sampleUsers[0];

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await api.fetchProjects();
        
        // Map MongoDB _id to id for frontend compatibility
        const formattedProjects = data.map((project: any) => ({
          id: project._id || project.id,
          name: project.name,
          description: project.description,
          tasks: project.tasks.map((task: any) => ({
            id: task._id || task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            assigneeId: task.assigneeId,
            creatorId: task.creatorId,
            attachments: task.attachments,
            comments: task.comments.map((comment: any) => ({
              id: comment._id || comment.id,
              content: comment.content,
              userId: comment.userId,
              createdAt: comment.createdAt,
            })),
            tags: task.tags,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          })),
          members: project.members.map((member: any) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            avatarUrl: member.avatarUrl,
          })),
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        }));
        
        setProjects(formattedProjects);
      } catch (err) {
        setError("Failed to fetch projects. Using sample data instead.");
        console.error("Error fetching projects:", err);
        
        // Fall back to sample data if API fails
        setProjects(sampleProjects);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const createProject = async (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create project in MongoDB
      const response = await api.createProject(project);
      
      // Format response for frontend
      const newProject: Project = {
        id: response._id || response.id,
        name: response.name,
        description: response.description,
        tasks: [],
        members: project.members, // Use the original members as they might not be returned from API
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      
      setProjects([...projects, newProject]);
      
      toast({
        title: "Project created",
        description: `${newProject.name} has been created successfully.`,
      });
    } catch (err) {
      setError("Failed to create project");
      console.error("Error creating project:", err);
      
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update project in MongoDB
      await api.updateProject(projectId, updates);
      
      setProjects(
        projects.map((project) =>
          project.id === projectId
            ? { ...project, ...updates, updatedAt: new Date().toISOString() }
            : project
        )
      );
      
      // Also update currentProject if it's the one being modified
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({ ...currentProject, ...updates, updatedAt: new Date().toISOString() });
      }
      
      toast({
        title: "Project updated",
        description: "Project has been updated successfully.",
      });
    } catch (err) {
      setError("Failed to update project");
      console.error("Error updating project:", err);
      
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete project from MongoDB
      await api.deleteProject(projectId);
      
      setProjects(projects.filter((project) => project.id !== projectId));
      
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
      }
      
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
    } catch (err) {
      setError("Failed to delete project");
      console.error("Error deleting project:", err);
      
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (
    projectId: string,
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newTask: Task = {
        id: `task-${Date.now()}`, // Temporary ID until we get the real one from the server
        ...task,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: []
      };

      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, tasks: [...project.tasks, newTask] }
          : project
      ));

      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? {
          ...prev,
          tasks: [...prev.tasks, newTask]
        } : null);
      }

      toast({
        title: "Task created",
        description: "Task has been created successfully"
      });

    } catch (err) {
      setError("Failed to create task");
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (
    projectId: string,
    taskId: string,
    updates: Partial<Task>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update task in MongoDB
      await api.updateTask(taskId, updates);
      
      setProjects(
        projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                    : task
                ),
                updatedAt: new Date().toISOString(),
              }
            : project
        )
      );
      
      // Also update currentProject if it's the one being modified
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          tasks: currentProject.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
          updatedAt: new Date().toISOString(),
        });
      }
      
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      });
    } catch (err) {
      setError("Failed to update task");
      console.error("Error updating task:", err);
      
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (
    projectId: string,
    taskId: string,
    status: TaskStatus
  ) => {
    await updateTask(projectId, taskId, { status });
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete task from MongoDB
      await api.deleteTask(taskId);
      
      setProjects(
        projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.filter((task) => task.id !== taskId),
                updatedAt: new Date().toISOString(),
              }
            : project
        )
      );
      
      // Also update currentProject if it's the one being modified
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          tasks: currentProject.tasks.filter((task) => task.id !== taskId),
          updatedAt: new Date().toISOString(),
        });
      }
      
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      });
    } catch (err) {
      setError("Failed to delete task");
      console.error("Error deleting task:", err);
      
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (projectId: string, taskId: string, content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const comment = {
        content,
        userId: currentUser.id,
      };
      
      // Add comment to task in MongoDB
      const response = await api.addComment(taskId, comment);
      
      // Format response for frontend
      const newComment: Comment = {
        id: response._id || response.id,
        content: response.content,
        userId: response.userId,
        createdAt: response.createdAt,
      };
      
      setProjects(
        projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        comments: [...task.comments, newComment],
                        updatedAt: new Date().toISOString(),
                      }
                    : task
                ),
                updatedAt: new Date().toISOString(),
              }
            : project
        )
      );
      
      // Also update currentProject if it's the one being modified
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject({
          ...currentProject,
          tasks: currentProject.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  comments: [...task.comments, newComment],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError("Failed to add comment");
      console.error("Error adding comment:", err);
      
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentUser,
        projects,
        currentProject,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        addComment,
        isLoading,
        error,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
