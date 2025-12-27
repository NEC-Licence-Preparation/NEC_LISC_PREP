import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

// PATCH - Update ticket status or add reply (authenticated users - password checked on frontend)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, priority, message } = body;
    
    await connectDB();
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Update status and priority if provided
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    
    // Add admin reply if message is provided
    if (message) {
      ticket.messages.push({
        senderId: session.user?.id || null,
        senderName: session.user?.name || 'Admin',
        message,
        isAdmin: true,
        timestamp: new Date()
      });
    }

    await ticket.save();

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

// GET - Get specific ticket
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    
    const ticket = await Ticket.findById(id).lean();
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Allow anyone logged in to view any ticket (password protection on admin frontend)
    // Users can only view via their own tickets page which filters by email
    // Admin page is password-protected and can view all

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

// POST - Add user reply to ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectDB();
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Only ticket owner can reply via POST (admins use PATCH)
    if (ticket.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add user reply
    ticket.messages.push({
      senderId: session.user?.id || null,
      senderName: session.user.name || 'User',
      senderEmail: session.user.email,
      message,
      isAdmin: false,
      timestamp: new Date()
    });

    await ticket.save();

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
  }
}
