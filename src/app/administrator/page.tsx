'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Administrator {
  email: string;
  name: string;
  addedBy: string;
  addedAt: Date;
  lastLogin: Date | null;
  isSuperAdmin: boolean;
}

interface UserStats {
  totalUsers: number;
  oauthUsers: number;
  registrationUsers: number;
  recentUsers: number;
  usersByFaculty: Array<{ faculty: string; count: number }>;
}

interface Ticket {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: Array<{
    senderId: string;
    senderName: string;
    message: string;
    isAdmin: boolean;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdministratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'admins' | 'stats'>('tickets');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Admin management states
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  
  // User stats states
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  // Ticket management states
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.email) {
        console.log('No session email, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Checking admin access for:', session.user.email);

      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        
        console.log('Admin check response:', data);
        
        if (!data.isAdmin) {
          console.log('Not an admin, redirecting to dashboard');
          setErrorMessage(`Access denied. Your email: ${session.user.email}\n\nRequired: alwaysphenomenal1@gmail.com or added administrator`);
          setLoading(false);
          setTimeout(() => router.push('/dashboard'), 4000);
          return;
        }
        
        console.log('Admin access granted!');
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setErrorMessage(`Error checking admin access: ${error}`);
        setLoading(false);
        setTimeout(() => router.push('/dashboard'), 4000);
      }
    };

    checkAccess();
  }, [session, status, router]);

  // Fetch data based on active tab
  useEffect(() => {
    if (loading) return;

    if (activeTab === 'tickets') {
      fetchTickets();
      const interval = setInterval(fetchTickets, 5000);
      return () => clearInterval(interval);
    } else if (activeTab === 'admins') {
      fetchAdministrators();
    } else if (activeTab === 'stats') {
      fetchUserStats();
    }
  }, [activeTab, loading]);

  // Fetch selected ticket details
  useEffect(() => {
    if (!selectedTicket || activeTab !== 'tickets') return;

    const fetchTicketDetails = async () => {
      try {
        const res = await fetch(`/api/tickets/${selectedTicket._id}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedTicket(data);
        }
      } catch (error) {
        console.error('Error fetching ticket details:', error);
      }
    };

    const interval = setInterval(fetchTicketDetails, 3000);
    return () => clearInterval(interval);
  }, [selectedTicket?._id, activeTab]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchAdministrators = async () => {
    try {
      const res = await fetch('/api/admin/list');
      if (res.ok) {
        const data = await res.json();
        setAdministrators(data.admins);
      }
    } catch (error) {
      console.error('Error fetching administrators:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminName) return;
    
    setAddingAdmin(true);
    try {
      const res = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, name: newAdminName })
      });
      
      if (res.ok) {
        setNewAdminEmail('');
        setNewAdminName('');
        fetchAdministrators();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to add administrator');
      }
    } catch (error) {
      console.error('Error adding administrator:', error);
      setErrorMessage('Failed to add administrator');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Remove ${email} from administrators?`)) return;
    
    try {
      const res = await fetch(`/api/admin/check?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchAdministrators();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to remove administrator');
      }
    } catch (error) {
      console.error('Error removing administrator:', error);
      setErrorMessage('Failed to remove administrator');
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    setSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: replyMessage,
          status: selectedTicket.status === 'open' ? 'in-progress' : selectedTicket.status
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket || data);
        setReplyMessage('');
        fetchTickets();
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setErrorMessage('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    
    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket || data);
        fetchTickets();
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update status');
    }
  };

  const handleUpdatePriority = async (priority: string) => {
    if (!selectedTicket) return;
    
    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket || data);
        fetchTickets();
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || 'Failed to update priority');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      setErrorMessage('Failed to update priority');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-[#A6B1E1]/30 text-[#424874]';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EEFF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#424874] mx-auto"></div>
          <p className="mt-4 text-[#424874]/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      {/* Navigation Bar - matching dashboard design */}
      <nav className="sticky top-0 z-50 border-b border-[#A6B1E1]/30 bg-[#424874] text-white backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            NEC Prep - Administrator
          </Link>
          
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
            >
              Dashboard
            </Link>
            {session?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
              >
                Admin Panel
              </Link>
            )}
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="h-8 w-8 rounded-full border border-white/30 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/30 text-white/80">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
              <span className="text-white/90">{session?.user?.name || session?.user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600 whitespace-pre-line">{errorMessage}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setErrorMessage(null);
                  router.push('/dashboard');
                }}
                className="px-6 py-2 bg-[#424874] text-white rounded-lg hover:bg-[#424874]/90 hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#424874]">Administrator Dashboard</h1>
              <p className="text-[#424874]/70 mt-1">Welcome, {session?.user?.name || session?.user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {session?.user?.image && (
                <img src={session.user.image} alt="Profile" className="w-12 h-12 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'tickets'
                  ? 'bg-[#424874] text-white shadow-lg'
                  : 'text-[#424874]/70 hover:bg-[#DCD6F7]/30'
              }`}
            >
              Support Tickets
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'admins'
                  ? 'bg-[#424874] text-white shadow-lg'
                  : 'text-[#424874]/70 hover:bg-[#DCD6F7]/30'
              }`}
            >
              Administrators
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-[#424874] text-white shadow-lg'
                  : 'text-[#424874]/70 hover:bg-[#DCD6F7]/30'
              }`}
            >
              User Statistics
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Tickets</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tickets.map(ticket => (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTicket?._id === ticket._id
                        ? 'border-[#424874] bg-[#DCD6F7]'
                        : 'border-gray-200 hover:border-[#A6B1E1] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#424874] flex items-center justify-center text-white font-bold">
                          {getInitials(ticket.userName)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                          <p className="text-sm text-gray-600">{ticket.userName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {selectedTicket ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status and Priority Controls */}
                  <div className="flex gap-3 mb-4">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handleUpdatePriority(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                    {selectedTicket.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.isAdmin
                              ? 'bg-[#424874] text-white'
                              : 'bg-gray-100 text-[#424874]'
                          }`}
                        >
                          <p className="text-sm font-medium mb-1">{msg.senderName}</p>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.isAdmin ? 'text-indigo-100' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="flex gap-2">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        rows={2}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={sendingReply || !replyMessage.trim()}
                        className="px-6 py-2 bg-[#424874] text-white rounded-xl hover:bg-[#424874]/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {sendingReply ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a ticket to view details
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Administrator Management</h2>
            
            {/* Add Admin Form */}
            <div className="bg-[#DCD6F7]/30 border border-[#A6B1E1]/30 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Add New Administrator</h3>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Full name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <button
                  onClick={handleAddAdmin}
                  disabled={addingAdmin || !newAdminEmail || !newAdminName}
                  className="px-6 py-2 bg-[#424874] text-white rounded-lg hover:bg-[#424874]/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {addingAdmin ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </div>

            {/* Admin List */}
            <div className="space-y-3">
              {administrators.map(admin => (
                <div
                  key={admin.email}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-[#A6B1E1] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#424874] flex items-center justify-center text-white font-bold">
                      {getInitials(admin.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added by: {admin.addedBy} • {new Date(admin.addedAt).toLocaleDateString()}
                        {admin.lastLogin && ` • Last login: ${new Date(admin.lastLogin).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {admin.isSuperAdmin && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                        Super Admin
                      </span>
                    )}
                    {!admin.isSuperAdmin && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">Total Users</div>
                <div className="text-4xl font-bold text-[#424874]">
                  {userStats?.totalUsers || 0}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">OAuth Users</div>
                <div className="text-4xl font-bold text-[#424874]">
                  {userStats?.oauthUsers || 0}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">Registration Users</div>
                <div className="text-4xl font-bold text-[#424874]">
                  {userStats?.registrationUsers || 0}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">New Users (7 days)</div>
                <div className="text-4xl font-bold text-[#424874]">
                  {userStats?.recentUsers || 0}
                </div>
              </div>
            </div>

            {/* Faculty Distribution */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Users by Faculty</h2>
              <div className="space-y-3">
                {userStats?.usersByFaculty.map(faculty => (
                  <div key={faculty.faculty} className="flex items-center justify-between p-4 rounded-xl bg-[#DCD6F7]/30">
                    <span className="font-medium text-gray-900">{faculty.faculty}</span>
                    <span className="px-4 py-1 bg-white rounded-full font-bold text-[#424874]">
                      {faculty.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
