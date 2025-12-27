import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Administrator from '@/models/Administrator';
import { isAdministrator } from '../check/route';

const SUPER_ADMIN_EMAIL = 'alwaysphenomenal1@gmail.com';

// GET - List all administrators
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdministrator(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await connectDB();
    const admins = await Administrator.find({}).sort({ addedAt: -1 });
    
    // Add super admin to the list
    const allAdmins = [
      {
        email: SUPER_ADMIN_EMAIL,
        name: 'Super Administrator',
        addedBy: 'System',
        addedAt: new Date('2024-01-01'),
        lastLogin: null,
        isSuperAdmin: true
      },
      ...admins.map(admin => ({
        email: admin.email,
        name: admin.name,
        addedBy: admin.addedBy,
        addedAt: admin.addedAt,
        lastLogin: admin.lastLogin,
        isSuperAdmin: false
      }))
    ];

    return NextResponse.json({ admins: allAdmins });
  } catch (error) {
    console.error('Error listing administrators:', error);
    return NextResponse.json({ error: 'Failed to list administrators' }, { status: 500 });
  }
}
