import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Grid,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, projects, currentProject, createProject, isLoading, logout } = useProject();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectDescription, setNewProjectDescription] = React.useState("");

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kanban Board", href: "/kanban", icon: Grid },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Team", href: "/team", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please provide a name for the project",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        members: currentUser ? [{
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: "admin",
          avatarUrl: currentUser.avatarUrl,
        }] : [],
        tasks: [], // Initialize with empty tasks array
      });

      setNewProjectName("");
      setNewProjectDescription("");
      setShowNewProjectDialog(false);

      toast({
        title: "Project created",
        description: "Your project has been created successfully",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <Link to="/" className="text-xl font-bold text-primary">
              Projexia
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <Menu /> : <X />}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-2")}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <Separator />

        {/* Projects List */}
        <div className="flex-shrink-0">
          <div className="p-4 flex items-center justify-between">
            {!collapsed && <h3 className="text-sm font-medium">Projects</h3>}
            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={collapsed ? "mx-auto" : ""}
                  disabled={isLoading}
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateProject} disabled={isLoading}>
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="px-2 space-y-1 max-h-48 overflow-y-auto">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/kanban?project=${project.id}`}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentProject?.id === project.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                {!collapsed && <span className="truncate">{project.name}</span>}
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* User Menu */}
        {currentUser && (
          <div className="p-4 flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
};

export default AppLayout;
