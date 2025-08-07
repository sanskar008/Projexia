// Middleware to load project members into a Set for fast membership checks
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");

module.exports = async function membershipSet(req, res, next) {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) return next();
  try {
    const project = await Project.findById(projectId).populate("members");
    if (!project) return res.status(404).json({ message: "Project not found" });
    // Create a Set of member IDs for O(1) membership checks
    req.memberIdSet = new Set(project.members.map((m) => m._id.toString()));
    next();
  } catch (err) {
    next(err);
  }
};
