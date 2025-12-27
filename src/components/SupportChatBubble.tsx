'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function SupportChatBubble() {
  const { data: session } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openTicket, setOpenTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [view, setView] = useState<'list' | 'create' | 'chat'>('list');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (session?.user?.email && isOpen) {
      fetchOpenTicket();
    }
  }, [session, isOpen]);

  // Auto-refresh ticket every 3 seconds when viewing chat
  useEffect(() => {
    if (openTicket && view === 'chat' && isOpen) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/tickets/${openTicket._id}`);
          if (response.ok) {
            const data = await response.json();
            setOpenTicket(data);
          }
        } catch (error) {
          console.error('Error refreshing ticket:', error);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [openTicket?._id, view, isOpen]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [openTicket?.messages]);

  const fetchOpenTicket = async () => {
    try {
      const response = await fetch('/api/tickets/my');
      if (response.ok) {
        const tickets = await response.json();
        // Get the most recent open or in-progress ticket
        const activeTicket = tickets.find((t: Ticket) => t.status !== 'closed');
        if (activeTicket) {
          setOpenTicket(activeTicket);
          setView('chat');
        } else {
          setView('create');
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setView('create');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userName: session.user.name || 'User',
          userEmail: session.user.email
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          subject: '',
          message: ''
        });
        
        // Fetch the newly created ticket and switch to chat view
        setTimeout(async () => {
          setSubmitted(false);
          await fetchOpenTicket();
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openTicket || !replyMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${openTicket._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage })
      });

      if (response.ok) {
        const data = await response.json();
        setOpenTicket(data.ticket);
        setReplyMessage('');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!openTicket) return;

    try {
      const response = await fetch(`/api/tickets/${openTicket._id}/close`, {
        method: 'POST'
      });

      if (response.ok) {
        setOpenTicket(null);
        setView('create');
        setShowCloseConfirm(false);
        setModalMessage('Ticket closed successfully!');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        setShowCloseConfirm(false);
        setModalMessage('Failed to close ticket. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      setShowCloseConfirm(false);
      setModalMessage('Failed to close ticket. Please try again.');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full border-2 border-white/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {session?.user?.name?.charAt(0) || '?'}
                </div>
              )}
              <h3 className="font-semibold">Support Chat</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/90 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-5xl mb-3">✓</div>
                <p className="text-lg font-semibold text-gray-800">Ticket Submitted!</p>
                <p className="text-sm text-gray-600 mt-2">Loading your conversation...</p>
              </div>
            ) : !session ? (
              <div className="text-center py-8">
                <p className="text-lg font-semibold text-gray-800 mb-4">Please Login</p>
                <p className="text-sm text-gray-600 mb-4">You need to be logged in to create a support ticket.</p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            ) : view === 'chat' && openTicket ? (
              <div className="flex flex-col h-125">
                {/* Ticket Header */}
                <div className="pb-3 border-b mb-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base text-gray-800">{openTicket.subject}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          openTicket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          openTicket.status === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{openTicket.status}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          openTicket.priority === 'high' ? 'bg-red-100 text-red-700' :
                          openTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>{openTicket.priority}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCloseConfirm(true)}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-medium px-3 py-1.5 rounded-md transition-all"
                      title="Close ticket"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setOpenTicket(null);
                      setView('create');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all flex items-center gap-1"
                  >
                    <span className="text-sm">+</span> Create New Ticket
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 px-1">
                  {openTicket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      {msg.isAdmin ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-sm font-semibold shadow-md">
                          🛡️
                        </div>
                      ) : session?.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || 'You'}
                          className="w-8 h-8 rounded-full shrink-0 shadow-md border-2 border-gray-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center shrink-0 text-sm font-semibold shadow-md">
                          {session?.user?.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-end'} flex-1 max-w-[75%]`}>
                        <div className={`${
                          msg.isAdmin
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-100 border-gray-200'
                        } border rounded-2xl px-4 py-2.5 shadow-sm`}>
                          <p className="text-sm whitespace-pre-wrap text-gray-800">{msg.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 px-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form */}
                {openTicket.status !== 'closed' ? (
                  <form onSubmit={handleReply} className="border-t pt-3 bg-gray-50 px-4 pb-4 rounded-b-2xl">
                    <div className="flex gap-2 items-end">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        className="flex-1 border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !replyMessage.trim()}
                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-sm"
                        aria-label="Send message"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="border-t pt-3 text-center text-sm text-gray-600 bg-gray-50 py-4 rounded-b-2xl">
                    This ticket is closed
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logged in as: {session.user?.email}
                  </label>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of your issue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Describe Your Problem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Please explain your problem in detail..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 hover:rotate-12"
        aria-label="Open support chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      </button>

      {/* Confirmation Modal for Close Ticket */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Close Ticket</h3>
                <p className="text-gray-600">Are you sure you want to close this ticket? This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTicket}
                className="px-4 py-2 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Success</h3>
                <p className="text-gray-600">{modalMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600">{modalMessage}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
