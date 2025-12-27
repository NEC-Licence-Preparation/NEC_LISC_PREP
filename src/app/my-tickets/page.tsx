'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TicketMessage {
  senderId: string | null;
  senderName: string;
  senderEmail?: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

interface Ticket {
  _id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchTickets();
    }
  }, [session]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets/my');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data.ticket);
        setReplyMessage('');
        fetchTickets();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-purple-600 bg-purple-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Support Tickets</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Your Tickets ({tickets.length})</h2>
            </div>
            <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTicket?._id === ticket._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">ID: {ticket._id}</div>
                      <h3 className="font-semibold text-sm">{ticket.subject}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-4">No tickets yet</p>
                  <p className="text-sm">Click the support bubble to create one!</p>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            {selectedTicket ? (
              <div className="flex flex-col h-[calc(100vh-200px)]">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="text-xs text-gray-500 mb-1">Ticket ID: {selectedTicket._id}</div>
                  <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedTicket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`${
                        msg.isAdmin
                          ? 'ml-12 bg-blue-50 border-blue-200'
                          : 'mr-12 bg-gray-50 border-gray-200'
                      } border rounded-lg p-4`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          {msg.isAdmin ? '🛡️ Support Team' : '👤 You'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== 'closed' && (
                  <form onSubmit={handleReply} className="p-4 border-t">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={submitting || !replyMessage.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                )}
                {selectedTicket.status === 'closed' && (
                  <div className="p-4 border-t bg-gray-50 text-center text-gray-600">
                    This ticket is closed. Contact support to reopen it.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a ticket to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
