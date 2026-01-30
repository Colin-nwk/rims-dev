import React, { useRef, useEffect, useState } from "react";
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle,
  Send,
  Loader2,
  MessageSquare,
  Trash2,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Complaint,
  type ComplaintMessage,
  getComplaintStatusColor,
  getComplaintCategoryColor,
} from "@/lib/api/complaints";

interface ComplaintChatProps {
  complaint: Complaint | null;
  currentUserId: number;
  onBack: () => void;
  onSendMessage: (content: string) => void;
  onEscalate: () => void;
  onResolve: () => void;
  onDelete: () => void;
  isSending?: boolean;
  isUpdating?: boolean;
  canManage?: boolean;
  isListCollapsed?: boolean;
  onToggleList?: () => void;
}

export const ComplaintChat: React.FC<ComplaintChatProps> = ({
  complaint,
  currentUserId,
  onBack,
  onSendMessage,
  onEscalate,
  onResolve,
  onDelete,
  isSending = false,
  isUpdating = false,
  canManage = false,
  isListCollapsed = false,
  onToggleList,
}) => {
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [complaint?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;
    onSendMessage(messageText.trim());
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Empty state when no complaint selected
  if (!complaint) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
          <MessageSquare className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">
          Select a Ticket
        </h3>
        <p className="max-w-xs text-center text-sm">
          Choose a ticket from the list to view the conversation or send a
          reply.
        </p>
      </div>
    );
  }

  const isResolved = complaint.status === "resolved";
  const isEscalated = complaint.status === "escalated";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden -ml-2 px-2 text-slate-500"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Show List Button - visible when list is collapsed */}
          {isListCollapsed && onToggleList && (
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-1.5 border-ncos-green-500 text-ncos-green-700 hover:bg-ncos-green-50"
              onClick={onToggleList}
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span className="text-xs font-medium">Show List</span>
            </Button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="font-semibold text-slate-900 truncate max-w-50 sm:max-w-xs"
                title={complaint.subject}
              >
                {complaint.subject}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getComplaintStatusColor(
                  complaint.status,
                )}`}
              >
                {complaint.status === "in-progress"
                  ? "In Progress"
                  : complaint.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 hidden sm:block">
              <span
                className={`px-1.5 py-0.5 rounded ${getComplaintCategoryColor(complaint.category)}`}
              >
                {complaint.category}
              </span>
              <span className="mx-2">•</span>
              {complaint.created_by_name}
              <span className="mx-2">•</span>#{complaint.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {canManage && !isResolved && (
          <div className="flex items-center gap-2 shrink-0">
            {!isEscalated && (
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:flex text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={onEscalate}
                disabled={isUpdating}
              >
                <ShieldAlert className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Escalate</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={onResolve}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Resolve</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* Delete button for owner */}
        {complaint.created_by === currentUserId && (
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30"
        ref={scrollRef}
      >
        {complaint.messages.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">
              No messages yet. Start the conversation below.
            </p>
          </div>
        ) : (
          complaint.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
            />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              placeholder="Type your message..."
              className="w-full min-h-15 max-h-30 resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ncos-green-500 focus:border-transparent transition-all"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />
          </div>
          <Button
            type="submit"
            className="h-15 px-5"
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: ComplaintMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const isSystem = message.content.startsWith("***");

  // Format timestamp to show AM/PM
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, return as-is (might be pre-formatted)
        return timestamp;
      }
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timestamp;
    }
  };

  // System messages (status changes, escalations)
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-wider text-center">
          {message.content.replace(/\*\*\*/g, "").trim()}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-sm ${
          isOwn
            ? "bg-ncos-green-600 text-white rounded-br-md"
            : "bg-white text-slate-800 border border-slate-100 rounded-bl-md"
        }`}
      >
        {/* Sender Info */}
        <div
          className={`flex items-baseline justify-between gap-4 mb-1.5 pb-1.5 border-b ${
            isOwn ? "border-white/20" : "border-slate-100"
          }`}
        >
          <span
            className={`text-xs font-semibold ${
              isOwn ? "text-ncos-green-100" : "text-slate-900"
            }`}
          >
            {message.sender_name}
            <span
              className={`ml-1.5 font-normal text-[10px] uppercase ${
                isOwn ? "text-ncos-green-200" : "text-slate-400"
              }`}
            >
              ({message.sender_role})
            </span>
          </span>
          <span
            className={`text-[10px] ${
              isOwn ? "text-ncos-green-200" : "text-slate-400"
            }`}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message Content */}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
};
