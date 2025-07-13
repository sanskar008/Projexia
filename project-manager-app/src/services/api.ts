import { Project, Task, Comment, ProjectMember } from "@/contexts/ProjectContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }
  return response.json();
};

// Project API
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    console.log('Fetching projects from:', `${API_URL}/projects`);
    const response = await fetch(`${API_URL}/projects`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const fetchProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
};

export const createProject = async (project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete project");
    }
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
};

// Task API
export const fetchTasksByProject = async (projectId: string): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching tasks for project ${projectId}:`, error);
    throw error;
  }
};

export const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
};

export const addComment = async (taskId: string, comment: { content: string; userId: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error adding comment to task ${taskId}:`, error);
    throw error;
  }
};

// Project Member API
export const inviteProjectMember = async (
  projectId: string,
  member: { email: string; role: string }
): Promise<ProjectMember> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error inviting member to project ${projectId}:`, error);
    throw error;
  }
};

export const removeProjectMember = async (
  projectId: string,
  memberId: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to remove project member");
    }
  } catch (error) {
    console.error(`Error removing member ${memberId} from project ${projectId}:`, error);
    throw error;
  }
};

export const updateProjectMemberRole = async (
  projectId: string,
  memberId: string,
  role: string
): Promise<ProjectMember> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/members/${memberId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating member role for ${memberId} in project ${projectId}:`, error);
    throw error;
  }
};
