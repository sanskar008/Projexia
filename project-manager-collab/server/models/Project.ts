
import mongoose, { Schema, Document } from 'mongoose';
import { TaskDocument } from './Task';
import { ProjectMemberDocument } from './ProjectMember';

export interface ProjectDocument extends Document {
  name: string;
  description: string;
  tasks: TaskDocument['_id'][];
  members: ProjectMemberDocument['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'ProjectMember' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ProjectDocument>('Project', ProjectSchema);
