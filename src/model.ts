import { Schema, model, Document, Types } from 'mongoose';


export interface ICategory{
  name:string;
}

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface INote extends Document {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  category: ICategory;
  user: Types.ObjectId;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });


const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: categorySchema, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { 
    timestamps: true 
  }
);

export const Note = model<INote>('Note', noteSchema);
export const Category = model<ICategory>('Category', categorySchema);
export const User = model<IUser>('User', userSchema);