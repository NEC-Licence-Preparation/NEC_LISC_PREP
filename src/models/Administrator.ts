import mongoose from 'mongoose';

export interface IAdministrator {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  addedBy: string;
  addedAt: Date;
  lastLogin?: Date;
}

const AdministratorSchema = new mongoose.Schema<IAdministrator>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  addedBy: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

const Administrator = mongoose.models.Administrator || mongoose.model<IAdministrator>('Administrator', AdministratorSchema);

export default Administrator;
