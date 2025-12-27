import { connectDB } from "./mongodb";
import User from "@/models/User";

export async function updateUserStreak(email: string) {
  try {
    await connectDB();
    
    const user = await User.findOne({ email });
    if (!user) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const lastActivity = user.lastActivityDate 
      ? new Date(user.lastActivityDate)
      : null;
    
    const lastActivityDay = lastActivity 
      ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate())
      : null;

    let currentStreak = user.currentStreak || 0;
    let longestStreak = user.longestStreak || 0;

    if (!lastActivityDay) {
      // First activity ever
      currentStreak = 1;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day - no change to streak
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        currentStreak += 1;
      } else {
        // Missed days - reset streak
        currentStreak = 1;
      }
    }

    // Update longest streak if current is higher
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    await User.updateOne(
      { email },
      {
        $set: {
          currentStreak,
          longestStreak,
          lastActivityDate: now,
        },
      }
    );

    return { currentStreak, longestStreak };
  } catch (error) {
    console.error("Error updating user streak:", error);
    return null;
  }
}
