import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

// GET - Fetch user's own tickets
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const tickets = await Ticket.find({ userEmail: session.user.email })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
