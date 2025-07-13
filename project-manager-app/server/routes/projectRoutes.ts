
import * as express from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import ProjectMember from '../models/ProjectMember';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate({
        path: 'tasks',
        populate: {
          path: 'comments'
        }
      })
      .populate('members');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'tasks',
        populate: {
          path: 'comments'
        }
      })
      .populate('members');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    const newProject = new Project({
      name,
      description,
      tasks: [],
      members: []
    });
    
    const savedProject = await newProject.save();
    
    // Add members to the project
    if (members && members.length > 0) {
      const projectMembers = members.map((member: any) => ({
        ...member,
        projectId: savedProject._id
      }));
      
      const savedMembers = await ProjectMember.insertMany(projectMembers);
      savedProject.members = savedMembers.map(member => member._id);
      await savedProject.save();
    }
    
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    project.name = name || project.name;
    project.description = description || project.description;
    project.updatedAt = new Date();
    
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Delete all tasks associated with the project
    await Task.deleteMany({ projectId: project._id });
    
    // Delete all members associated with the project
    await ProjectMember.deleteMany({ projectId: project._id });
    
    // Delete the project
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Invite a member to a project
router.post('/:id/invite', async (req, res) => {
  try {
    const { email, role = 'member', name } = req.body;
    const projectId = req.params.id;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if member already exists in the project
    const existingMember = await ProjectMember.findOne({ email, projectId });
    if (existingMember) {
      return res.status(400).json({ message: 'Member already invited to this project' });
    }

    // Generate avatar URL (optional, can be improved)
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    // Create new member
    const newMember = new ProjectMember({
      name,
      email,
      role,
      avatarUrl,
      projectId
    });
    await newMember.save();

    // Add member to project
    project.members.push(newMember._id);
    await project.save();

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Remove a member from a project
router.delete('/:projectId/members/:memberId', async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove member from project.members array
    project.members = project.members.filter(
      (m: any) => m.toString() !== memberId
    );
    await project.save();

    // Remove the ProjectMember document
    await ProjectMember.findByIdAndDelete(memberId);

    res.json({ message: 'Member removed from project' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
