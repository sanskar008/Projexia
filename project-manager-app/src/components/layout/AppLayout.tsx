import React from "react";
import { Link, useLocation } from "react-router-dom";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, projects, currentProject } = useProject();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
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
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
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
            <div className="text-xl font-bold text-primary">TaskForge</div>
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
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-2")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <Separator />

        {/* Projects List */}
        <div className="flex-shrink-0">
          <div className="p-4 flex items-center justify-between">
            {!collapsed && <h3 className="text-sm font-medium">Projects</h3>}
            <Button variant="ghost" size="icon" className={collapsed ? "mx-auto" : ""}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-2 space-y-1 max-h-48 overflow-y-auto">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  currentProject?.id === project.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                {!collapsed && (
                  <span className="truncate">{project.name}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* User Menu */}
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
