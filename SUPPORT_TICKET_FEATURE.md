# Support Ticket System

## Overview

A complete support ticket system has been added to the application with a floating chat bubble widget and an admin management interface.

## Features

### For Users

- **Chat Bubble Widget**: A floating chat bubble in the bottom-right corner of every page
- **Easy Ticket Creation**: Click the bubble to open a form and submit support tickets
- **Anonymous Support**: Users can create tickets whether logged in or not
- **Auto-fill for Logged Users**: Name and email are pre-filled for authenticated users

### For Admins

- **Admin Dashboard**: Visit `/admin_tickets` to view and manage all support tickets
- **Ticket Management**:
  - View all tickets sorted by most recent
  - Change ticket status (Open, In Progress, Closed)
  - Set priority levels (Low, Medium, High)
  - Reply to tickets directly from the interface
- **Real-time Updates**: Ticket list updates automatically after any changes
- **Conversation View**: See the full conversation history for each ticket

## Technical Implementation

### Database Model

- **Location**: `src/models/Ticket.ts`
- **Fields**:
  - User information (email, name, optional userId)
  - Subject and status
  - Priority level
  - Messages array with sender info and timestamps

### API Routes

- **POST `/api/tickets`**: Create a new ticket
- **GET `/api/tickets`**: Fetch all tickets (admin only)
- **GET `/api/tickets/[id]`**: Get specific ticket details (admin only)
- **PATCH `/api/tickets/[id]`**: Update ticket status/priority or add admin reply

### Components

- **SupportChatBubble**: (`src/components/SupportChatBubble.tsx`)

  - Floating widget visible on all pages
  - Form for ticket submission
  - Success confirmation

- **Admin Tickets Page**: (`src/app/admin_tickets/page.tsx`)
  - Two-panel interface
  - Ticket list with status/priority indicators
  - Detailed ticket view with reply functionality

### Security

- Admin-only access to ticket viewing and management
- Session validation on all admin endpoints
- Support for both authenticated and anonymous ticket creation

## Usage

### Creating a Ticket

1. Click the blue chat bubble in the bottom-right corner
2. Fill in your name, email, subject, and message
3. Click "Submit Ticket"
4. You'll see a confirmation message

### Managing Tickets (Admin)

1. Navigate to `/admin_tickets`
2. Click any ticket in the left panel to view details
3. Use the dropdowns to change status or priority
4. Type a reply in the text area and click "Send Reply"
5. The user will see your response in the conversation history

## Future Enhancements

- Email notifications for ticket updates
- User dashboard to view their own tickets
- File attachment support
- Ticket search and filtering
- Automated ticket assignment
