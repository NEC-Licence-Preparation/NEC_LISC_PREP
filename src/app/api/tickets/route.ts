import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

// GET - Fetch all tickets (authenticated users only - password checked on frontend)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const tickets = await Ticket.find({})
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST - Create a new ticket
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    const { subject, message, userName, userEmail } = body;
    
    if (!subject || !message || !userName || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    
    const ticket = await Ticket.create({
      userId: session?.user?.id || undefined,
      userEmail,
      userName,
      subject,
      messages: [{
        senderId: session?.user?.id || null,
        senderName: userName,
        senderEmail: userEmail,
        message,
        isAdmin: false,
        timestamp: new Date()
      }]
    });

    return NextResponse.json({ success: true, ticketId: ticket._id });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
