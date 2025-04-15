
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate directly without using toast to avoid hook-related issues
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Project Management Platform</h1>
        <p className="text-xl text-gray-600 mb-8">A comprehensive tool where teams can manage projects with real-time updates, Kanban boards, and team collaboration.</p>
        
        <div className="space-y-4">
          <Button size="lg" onClick={handleGetStarted} className="px-8">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
