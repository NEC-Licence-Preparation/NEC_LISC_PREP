'use client';

import { useEffect, useState, useRef } from 'react';
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

export default function AdminTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.email) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        
        if (!data.isAdmin) {
          router.push('/dashboard');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/dashboard');
      }
    };

    checkAccess();
  }, [session, status, router]);

  useEffect(() => {
    if (loading) return;
    
    fetchTickets();
    
    // Auto-refresh tickets every 5 seconds
    const interval = setInterval(() => {
      fetchTickets();
    }, 5000);

    return () => clearInterval(interval);
  }, [loading]);

  // Auto-refresh selected ticket every 3 seconds
  useEffect(() => {
    if (!selectedTicket) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/tickets/${selectedTicket._id}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedTicket(data);
        }
      } catch (error) {
        console.error('Error refreshing ticket:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTicket?._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && selectedTicket) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
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

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchTickets();
        if (selectedTicket?._id === ticketId) {
          const data = await response.json();
          setSelectedTicket(data.ticket);
        }
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handlePriorityChange = async (ticketId: string, priority: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });

      if (response.ok) {
        fetchTickets();
        if (selectedTicket?._id === ticketId) {
          const data = await response.json();
          setSelectedTicket(data.ticket);
        }
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
            <p className="text-gray-600 mt-1">Manage and respond to user support requests</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="text-lg font-bold text-blue-600">{tickets.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-linear-to-r from-blue-50 to-blue-100">
              <h2 className="text-lg font-semibold text-gray-800">Tickets ({tickets.length})</h2>
            </div>
            <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    selectedTicket?._id === ticket._id 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1 font-mono">#{ticket._id.slice(-6)}</div>
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{ticket.subject}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold">
                      {ticket.userName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-600 flex-1 truncate">{ticket.userName}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-medium">No tickets yet</p>
                  <p className="text-sm mt-1">Tickets will appear here when users create them</p>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {selectedTicket ? (
              <div className="flex flex-col h-[calc(100vh-200px)]">
                {/* Header */}
                <div className="p-5 border-b bg-linear-to-r from-gray-50 to-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1 font-mono">Ticket #{selectedTicket._id.slice(-8)}</div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-semibold">
                          {selectedTicket.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{selectedTicket.userName}</p>
                          <p className="text-xs text-gray-500">{selectedTicket.userEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Status:</label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Priority:</label>
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) => handlePriorityChange(selectedTicket._id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                  {selectedTicket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      {msg.isAdmin ? (
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-sm font-semibold shadow-md">
                          🛡️
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center shrink-0 text-sm font-semibold shadow-md">
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-end'} flex-1 max-w-[75%]`}>
                        <div className={`${
                          msg.isAdmin
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200'
                        } border rounded-2xl px-4 py-3 shadow-sm`}>
                          <div className="text-xs font-semibold mb-1 text-gray-700">
                            {msg.isAdmin ? 'Support Team' : msg.senderName}
                          </div>
                          <p className="text-sm whitespace-pre-wrap text-gray-800">{msg.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 px-2">
                          {new Date(msg.timestamp).toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                <form onSubmit={handleReply} className="p-4 border-t bg-white">
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !replyMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <svg className="w-24 h-24 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-lg font-medium">Select a ticket to view details</p>
                <p className="text-sm mt-2">Click on any ticket from the list to start</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
