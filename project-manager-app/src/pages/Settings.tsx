
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { currentUser } = useProject();

  const handleNotificationToggle = (enabled: boolean) => {
    toast({
      title: `Notifications ${enabled ? 'enabled' : 'disabled'}`,
      description: `You will ${enabled ? 'now' : 'no longer'} receive notifications.`
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your tasks and projects
                </p>
              </div>
              <Switch id="notifications" onCheckedChange={handleNotificationToggle} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {currentUser.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {currentUser.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive"
              onClick={() => {
                toast({
                  title: "Action required",
                  description: "Please contact support to delete your account.",
                  variant: "destructive"
                });
              }}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
