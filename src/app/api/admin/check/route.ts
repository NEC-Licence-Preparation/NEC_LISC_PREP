import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Administrator from '@/models/Administrator';

const SUPER_ADMIN_EMAIL = 'alwaysphenomenal1@gmail.com';

// Check if user is administrator
export async function isAdministrator(email: string): Promise<boolean> {
  if (email === SUPER_ADMIN_EMAIL) return true;
  
  await connectDB();
  const admin = await Administrator.findOne({ email: email.toLowerCase() });
  return !!admin;
}

// GET - Check if current user is administrator
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const isAdmin = await isAdministrator(session.user.email);
    
    // Update last login if admin
    if (isAdmin && session.user.email !== SUPER_ADMIN_EMAIL) {
      await connectDB();
      await Administrator.findOneAndUpdate(
        { email: session.user.email.toLowerCase() },
        { lastLogin: new Date() }
      );
    }

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}

// POST - Add new administrator
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdministrator(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await req.json();
    const { email, name } = body;
    
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    await connectDB();
    
    // Check if already exists
    const existing = await Administrator.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Administrator already exists' }, { status: 400 });
    }

    const admin = await Administrator.create({
      email: email.toLowerCase(),
      name,
      addedBy: session.user.email
    });

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error('Error adding administrator:', error);
    return NextResponse.json({ error: 'Failed to add administrator' }, { status: 500 });
  }
}

// DELETE - Remove administrator
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdministrator(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Can't remove super admin
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Cannot remove super administrator' }, { status: 400 });
    }

    await connectDB();
    await Administrator.findOneAndDelete({ email: email.toLowerCase() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing administrator:', error);
    return NextResponse.json({ error: 'Failed to remove administrator' }, { status: 500 });
  }
}
