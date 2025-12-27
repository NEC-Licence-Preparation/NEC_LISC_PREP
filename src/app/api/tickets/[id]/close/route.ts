import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

// POST - Close ticket
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
    await connectDB();
    
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Only ticket owner can close their ticket
    if (ticket.userEmail !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    ticket.status = 'closed';
    await ticket.save();

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error closing ticket:', error);
    return NextResponse.json({ error: 'Failed to close ticket' }, { status: 500 });
  }
}
