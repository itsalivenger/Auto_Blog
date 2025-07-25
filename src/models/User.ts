import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  name: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
