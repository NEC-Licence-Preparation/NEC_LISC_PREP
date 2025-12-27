import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { isAdministrator } from '../check/route';

// GET - Get user statistics
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
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get OAuth users (users with provider field or image field from OAuth)
    const oauthUsers = await User.countDocuments({ 
      $or: [
        { provider: { $exists: true } },
        { image: { $regex: /^https?:\/\//i } }
      ]
    });
    
    // Registration users = total - oauth
    const registrationUsers = totalUsers - oauthUsers;
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    // Get users by faculty
    const usersByFaculty = await User.aggregate([
      { $group: { _id: '$faculty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return NextResponse.json({
      totalUsers,
      oauthUsers,
      registrationUsers,
      recentUsers,
      usersByFaculty: usersByFaculty.map(f => ({
        faculty: f._id || 'Not selected',
        count: f.count
      }))
    });
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return NextResponse.json({ error: 'Failed to get statistics' }, { status: 500 });
  }
}
