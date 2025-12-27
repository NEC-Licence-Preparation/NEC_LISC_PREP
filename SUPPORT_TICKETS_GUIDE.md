# Support Ticket System - Updated

## Overview

A complete support ticket system with user and admin functionality. Users can create tickets, view their tickets, and reply to them. Admins can view all tickets with password protection and manage them.

## Key Features

### For Users

✅ **Login Required** - Must be logged in to create tickets
✅ **Chat Bubble Widget** - Floating button in bottom-right corner
✅ **Create Tickets** - Describe problems in detail
✅ **View My Tickets** - Access via `/my-tickets` or navbar
✅ **Reply to Tickets** - Continue conversations with support
✅ **Email Tracking** - Tickets tied to user's email
✅ **Status Visibility** - See ticket status and priority

### For Admins

✅ **Password Protection** - Admin password: `dollarboysushil`
✅ **View All Tickets** - Access via `/admin_tickets`
✅ **Ticket ID Display** - Prominently shown for easy reference
✅ **User Information** - See user name and email
✅ **Status Management** - Change between Open/In Progress/Closed
✅ **Priority Levels** - Set Low/Medium/High priority
✅ **Reply to Users** - Respond to tickets
✅ **Conversation History** - See full message thread

## User Journey

### Creating a Support Ticket

1. Login to your account
2. Click the blue chat bubble (💬) in bottom-right corner
3. If not logged in, you'll be prompted to login
4. Fill in:
   - **Subject**: Brief description
   - **Message**: Detailed explanation of your problem
5. Click "Submit Ticket"
6. See confirmation message
7. Access your tickets anytime via "My Tickets" in navbar

### Viewing Your Tickets

1. Click "My Tickets" in navigation bar
2. See list of all your tickets with:
   - Ticket ID
   - Subject
   - Status (Open/In Progress/Closed)
   - Priority (Low/Medium/High)
   - Creation date
3. Click any ticket to view full conversation
4. Reply to open tickets
5. Closed tickets show message that ticket is closed

## Admin Journey

### Accessing Admin Panel

1. Navigate to `/admin_tickets`
2. Enter admin password: `dollarboysushil`
3. Click "Access Admin Panel"

### Managing Tickets

1. View all tickets in left panel sorted by most recent
2. Click any ticket to view:
   - **Ticket ID** (shown at top)
   - **User Information** (name and email)
   - **Subject**
   - **Current Status and Priority**
   - **Full Conversation Thread**
3. Update ticket:
   - Change **Status** dropdown (Open/In Progress/Closed)
   - Change **Priority** dropdown (Low/Medium/High)
   - Type reply in text area
   - Click "Send Reply"
4. Changes are automatically saved

## API Endpoints

| Method | Endpoint            | Access          | Description                  |
| ------ | ------------------- | --------------- | ---------------------------- |
| POST   | `/api/tickets`      | Logged-in users | Create new ticket            |
| GET    | `/api/tickets`      | Admin only      | Get all tickets              |
| GET    | `/api/tickets/my`   | Logged-in users | Get user's own tickets       |
| GET    | `/api/tickets/[id]` | Admin or owner  | Get specific ticket          |
| PATCH  | `/api/tickets/[id]` | Admin only      | Update status/priority/reply |
| POST   | `/api/tickets/[id]` | Ticket owner    | Add user reply               |

## File Structure

```
src/
├── models/
│   └── Ticket.ts                       # Database model
├── app/
│   ├── api/
│   │   └── tickets/
│   │       ├── route.ts                # Create & list tickets
│   │       ├── my/
│   │       │   └── route.ts            # User's own tickets
│   │       └── [id]/
│   │           └── route.ts            # Get, update, reply
│   ├── admin_tickets/
│   │   └── page.tsx                    # Admin management page
│   └── my-tickets/
│       └── page.tsx                    # User tickets page
└── components/
    ├── SupportChatBubble.tsx           # Floating widget
    └── layout/
        └── NavBar.tsx                  # Navigation with My Tickets link
```

## Security Features

- ✅ Password protection for admin panel
- ✅ Session validation on all endpoints
- ✅ Users can only view/reply to their own tickets
- ✅ Admins can view/manage all tickets
- ✅ Proper authorization checks

## Navigation Links

- **Users**: "My Tickets" in navbar (when logged in)
- **Admin**: "Support Tickets" link in `/admin` dashboard
- **Admin**: Direct access via `/admin_tickets`

## Status Indicators

### Status Colors

- 🔵 **Open** - Blue badge
- 🟣 **In Progress** - Purple badge
- ⚫ **Closed** - Gray badge

### Priority Colors

- 🔴 **High** - Red badge
- 🟡 **Medium** - Yellow badge
- 🟢 **Low** - Green badge

## Notes

- Tickets are automatically tied to user's email
- Users see "👤 You" for their messages
- Users see "🛡️ Support Team" for admin replies
- Closed tickets cannot be replied to by users
- Admin can still reply to closed tickets
- All timestamps are shown in local timezone

## Future Enhancements

- Email notifications when admin replies
- File attachments
- Search and filter functionality
- Ticket categories
- Canned responses for admins
- Reopen closed tickets feature
- Unread message indicators
