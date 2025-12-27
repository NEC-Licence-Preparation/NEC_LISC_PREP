import mongoose from 'mongoose';

export interface ITicketMessage {
  senderId: mongoose.Types.ObjectId | null; // null for anonymous users
  senderName: string;
  senderEmail?: string;
  message: string;
  isAdmin: boolean;
  timestamp: Date;
}

export interface ITicket {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // optional for logged-in users
  userEmail: string;
  userName: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new mongoose.Schema<ITicketMessage>({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  senderName: {
    type: String,
    required: true
  },
  senderEmail: String,
  message: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const TicketSchema = new mongoose.Schema<ITicket>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  messages: [TicketMessageSchema]
}, {
  timestamps: true
});

const Ticket = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
