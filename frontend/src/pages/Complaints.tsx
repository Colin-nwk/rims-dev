import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input, TextArea, Select } from '../components/ui/Components';
import { useAuth, useComplaints } from '../App';
import { Complaint } from '../types';
import { MessageSquare, Plus, Send, MoreVertical, ShieldAlert, CheckCircle, Clock, User, Filter, ArrowLeft } from 'lucide-react';

const Complaints = () => {
  const { user } = useAuth();
  const { complaints, createComplaint, sendMessage, updateStatus } = useComplaints();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'escalated'>('all');

  // New Ticket Form State
  const [newTicket, setNewTicket] = useState<{subject: string; category: Complaint['category']; priority: Complaint['priority']; message: string}>({
    subject: '',
    category: 'Other',
    priority: 'medium',
    message: ''
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedId, complaints]);

  if (!user) return null;

  // --- Filtering Logic ---
  const visibleComplaints = complaints.filter(c => {
    const roleCheck = user.role === 'staff' ? c.createdBy === user.id : true;
    const statusCheck = statusFilter === 'all' 
      ? true 
      : statusFilter === 'closed' 
        ? c.status === 'resolved' 
        : statusFilter === 'escalated'
          ? c.status === 'escalated'
          : c.status === 'open' || c.status === 'in-progress';
    
    return roleCheck && statusCheck;
  });

  const activeComplaint = complaints.find(c => c.id === selectedId);

  // --- Handlers ---

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createComplaint(newTicket.subject, newTicket.category, newTicket.priority);
    setIsNewModalOpen(false);
    setNewTicket({ subject: '', category: 'Other', priority: 'medium', message: '' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedId) return;
    sendMessage(selectedId, messageText);
    setMessageText('');
    
    if (activeComplaint?.status === 'resolved') {
        updateStatus(selectedId, 'in-progress');
    }
  };

  const handleEscalate = () => {
    if (!selectedId) return;
    if (window.confirm("Are you sure you want to escalate this ticket to Super Admin?")) {
        updateStatus(selectedId, 'escalated');
        sendMessage(selectedId, `*** TICKET ESCALATED TO SUPER ADMIN BY ${user.firstName.toUpperCase()} ***`);
    }
  };

  const handleResolve = () => {
    if (!selectedId) return;
    updateStatus(selectedId, 'resolved');
    sendMessage(selectedId, `*** Ticket marked as Resolved by ${user.firstName} ***`);
  };

  // --- Render Helpers ---

  const getPriorityColor = (p: string) => {
    switch(p) {
        case 'critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50';
        case 'high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-900/50';
        case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50';
        default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-navy-700 dark:text-slate-300 dark:border-navy-600';
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
        case 'open': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
        case 'in-progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
        case 'resolved': return 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300';
        case 'escalated': return 'bg-red-50 text-red-600 border border-red-200 font-bold dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
        default: return 'bg-slate-100 dark:bg-navy-700';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] flex md:gap-6 relative">
      {/* Sidebar List */}
      <Card 
        noPadding 
        className={`
          flex-col h-full border-r border-slate-200 dark:border-navy-700 
          w-full md:w-80 lg:w-96 
          ${selectedId ? 'hidden md:flex' : 'flex'}
        `}
      >
        <div className="p-4 border-b border-slate-100 dark:border-navy-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-navy-900 dark:text-white text-lg">Help Desk</h2>
                <Button size="sm" onClick={() => setIsNewModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> New
                </Button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'open', 'escalated', 'closed'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter as any)}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                            statusFilter === filter 
                            ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-navy-800 dark:text-slate-400 dark:hover:bg-navy-700'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {visibleComplaints.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No tickets found</p>
                </div>
            ) : (
                visibleComplaints.map(ticket => (
                    <div 
                        key={ticket.id}
                        onClick={() => setSelectedId(ticket.id)}
                        className={`p-4 border-b border-slate-100 dark:border-navy-700 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-navy-800/50 ${
                            selectedId === ticket.id 
                            ? 'bg-blue-50/50 dark:bg-navy-800 border-l-4 border-l-navy-900 dark:border-l-gold-500' 
                            : 'border-l-4 border-l-transparent'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide border ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-medium text-navy-900 dark:text-white truncate mb-1">{ticket.subject}</h4>
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{ticket.createdByName}</span>
                             <Badge className={`${getStatusColor(ticket.status)} border-none`}>{ticket.status}</Badge>
                        </div>
                    </div>
                ))
            )}
        </div>
      </Card>

      {/* Chat Area */}
      <Card 
        noPadding 
        className={`
          flex-1 flex-col h-full overflow-hidden bg-slate-50/30 dark:bg-navy-950/50
          ${selectedId ? 'flex' : 'hidden md:flex'}
        `}
      >
        {selectedId && activeComplaint ? (
            <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 bg-white dark:bg-navy-800 border-b border-slate-200 dark:border-navy-700 flex justify-between items-center shadow-xs z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="md:hidden -ml-2 px-2 text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
                            onClick={() => setSelectedId(null)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-medium text-lg sm:text-xl text-navy-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{activeComplaint.subject}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(activeComplaint.status)}`}>
                                    {activeComplaint.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                                Created by {activeComplaint.createdByName} • {activeComplaint.category} • {activeComplaint.id}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {user.role !== 'staff' && activeComplaint.status !== 'resolved' && (
                             <>
                                {activeComplaint.status !== 'escalated' && user.role === 'hr' && (
                                    <Button size="sm" variant="outline" className="hidden sm:flex text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-500/30 dark:hover:bg-orange-500/10" onClick={handleEscalate}>
                                        <ShieldAlert className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Escalate</span>
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10" onClick={handleResolve}>
                                    <CheckCircle className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Resolve</span>
                                </Button>
                             </>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {activeComplaint.messages.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                            <p>No messages yet. Start the conversation.</p>
                        </div>
                    ) : (
                        activeComplaint.messages.map((msg, idx) => {
                            const isMe = msg.senderId === user.id;
                            const isSystem = msg.content.startsWith('***');
                            
                            if (isSystem) {
                                return (
                                    <div key={idx} className="flex justify-center my-4">
                                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-navy-800 px-3 py-1 rounded-full uppercase tracking-wider text-center">
                                            {msg.content.replace(/\*\*\*/g, '').trim()}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] sm:max-w-[80%] rounded-xl p-3 shadow-xs ${
                                        isMe 
                                        ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900 rounded-tr-none' 
                                        : 'bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-navy-700 rounded-tl-none'
                                    }`}>
                                        <div className="flex items-baseline justify-between gap-4 mb-1 border-b border-white/10 dark:border-navy-900/10 pb-1">
                                            <span className={`text-xs font-bold ${isMe ? 'text-gold-400 dark:text-navy-700' : 'text-navy-900 dark:text-white'}`}>
                                                {msg.senderName} 
                                                <span className="ml-1 opacity-70 font-normal uppercase text-[9px]">({msg.role})</span>
                                            </span>
                                            <span className={`text-[10px] ${isMe ? 'text-slate-300 dark:text-navy-700/70' : 'text-slate-400 dark:text-slate-500'}`}>{msg.timestamp}</span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-navy-800 border-t border-slate-200 dark:border-navy-700">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                        <TextArea 
                            placeholder="Type your message here..." 
                            className="min-h-[60px] max-h-[120px] resize-y"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <Button type="submit" className="h-[60px] px-6" disabled={!messageText.trim()}>
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-navy-950/50">
                <div className="w-16 h-16 bg-white dark:bg-navy-800 rounded-full flex items-center justify-center mb-4 shadow-xs">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-navy-900 dark:text-white mb-2">Select a Ticket</h3>
                <p className="max-w-xs text-center text-sm">Choose a ticket from the list to view conversation history or send a reply.</p>
            </div>
        )}
      </Card>

      {/* New Ticket Modal */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Create Support Ticket">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input 
                  label="Subject" 
                  placeholder="Brief summary of the issue"
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  required
              />
              
              <div className="grid grid-cols-2 gap-4">
                  <Select 
                      label="Category"
                      value={newTicket.category}
                      onChange={e => setNewTicket({...newTicket, category: e.target.value as any})}
                  >
                      <option value="Payroll">Payroll</option>
                      <option value="Leave">Leave</option>
                      <option value="Workplace">Workplace</option>
                      <option value="IT">IT Support</option>
                      <option value="Other">Other</option>
                  </Select>
                  
                  <Select 
                      label="Priority"
                      value={newTicket.priority}
                      onChange={e => setNewTicket({...newTicket, priority: e.target.value as any})}
                  >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                  </Select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Ticket</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default Complaints;
