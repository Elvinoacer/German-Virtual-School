"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { initSocket, disconnectSocket, SOCKET_EVENTS } from "@/lib/socket";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
  image: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
  sender: User;
}

interface Conversation {
  partner: User;
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    amISender: boolean;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [contactsSearch, setContactsSearch] = useState('');
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsTotalPages, setContactsTotalPages] = useState(1);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMoreStudents, setIsLoadingMoreStudents] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [initialUserIdHandled, setInitialUserIdHandled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Handle URL query param for direct navigation from notifications
  useEffect(() => {
    const userIdFromUrl = searchParams.get('userId');
    if (userIdFromUrl && !initialUserIdHandled && !isLoadingConversations) {
      setSelectedUserId(userIdFromUrl);
      fetchMessages(userIdFromUrl);
      setInitialUserIdHandled(true);
    }
  }, [searchParams, isLoadingConversations, initialUserIdHandled]);

  // Initial Fetch & Socket Setup
  useEffect(() => {
    if (!user?.id) return;

    fetchConversations();
    
    // Init Socket with user ID as token fallback
    socketRef.current = initSocket(user.id);
    
    // Listen for new messages
    socketRef.current.on(SOCKET_EVENTS.MESSAGE_NEW, (newMessage: Message) => {
        handleIncomingMessage(newMessage);
    });

    // Listen for read events from others
    socketRef.current.on('message:read_relay', ({ messageId }: { messageId: string }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
    });

    // Polling fallback (every 10s) to ensure sync
    const intervalId = setInterval(() => {
        fetchConversations(false); // Silent fetch
        if (selectedUserId) {
            fetchMessages(selectedUserId, false); // Silent fetch
        }
    }, 10000);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(SOCKET_EVENTS.MESSAGE_NEW);
      }
      disconnectSocket();
      clearInterval(intervalId);
    };
  }, [user?.id, selectedUserId]); // Re-bind if user changes

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchContacts = async (search = '', page = 1, append = false) => {
      if (append) {
          setIsLoadingMoreStudents(true);
      } else {
          setIsLoadingContacts(true);
      }
      try {
          const params = new URLSearchParams();
          if (search.trim()) params.set('search', search.trim());
          params.set('page', page.toString());
          params.set('limit', '20');
          
          const res = await fetch(`/api/messages/contacts?${params.toString()}`);
          if (res.ok) {
              const data = await res.json();
              const result = data.data;
              setFaculty(result.faculty || []);
              if (append) {
                  setStudents(prev => [...prev, ...(result.students || [])]);
              } else {
                  setStudents(result.students || []);
              }
              setContactsPage(result.pagination?.page || 1);
              setContactsTotalPages(result.pagination?.totalPages || 1);
          }
      } catch (error) {
          console.error("Failed to fetch contacts", error);
      } finally {
          setIsLoadingContacts(false);
          setIsLoadingMoreStudents(false);
      }
  };

  const handleContactsSearch = (value: string) => {
      setContactsSearch(value);
      fetchContacts(value, 1, false);
  };

  const loadMoreStudents = () => {
      if (contactsPage < contactsTotalPages) {
          fetchContacts(contactsSearch, contactsPage + 1, true);
      }
  };

  const openNewChatModal = () => {
      setIsNewChatModalOpen(true);
      setContactsSearch('');
      setContactsPage(1);
      fetchContacts('', 1, false);
  };

  const handleIncomingMessage = (newMessage: Message) => {
      // 1. Update Conversations List
      setConversations(prev => {
          const exists = prev.find(c => c.partner.id === newMessage.senderId);
          if (exists) {
              // Move to top and update
              const updated = {
                  ...exists,
                  lastMessage: {
                      content: newMessage.content,
                      createdAt: newMessage.createdAt,
                      isRead: false,
                      amISender: false
                  },
                  unreadCount: selectedUserId === newMessage.senderId ? 0 : exists.unreadCount + 1
              };
              return [updated, ...prev.filter(c => c.partner.id !== newMessage.senderId)];
          } else {
              // New conversation (would need full partner object, might need to fetch if not present. 
              // For simplicity, we might just trigger a re-fetch of conversations here)
              fetchConversations(false);
              return prev;
          }
      });

      // 2. Update Active Chat if matching
      if (selectedUserId === newMessage.senderId) {
          setMessages(prev => {
              if (prev.find(m => m.id === newMessage.id)) return prev; // Dedup
              return [...prev, newMessage];
          });
          
          // Emit 'read' event if chat is active
          socketRef.current?.emit('message:read', { 
              messageId: newMessage.id, 
              senderId: newMessage.senderId 
          });
      }
  };

  const fetchConversations = async (showLoading = true) => {
    if (showLoading) setIsLoadingConversations(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      if (showLoading) setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (userId: string, showLoading = true) => {
    if (showLoading) setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${userId}`);
      if (res.ok) {
        const data = await res.json();
        // The API returns { messages: [], myId: "..." }
        // Simple deduplication if polling
        if (!showLoading) {
             setMessages(prev => {
                 const newMsgs = data.data.messages || [];
                 if (newMsgs.length === prev.length) return prev; // Naive check
                 return newMsgs;
             });
        } else {
             setMessages(data.data.messages || []);
        }
        
        // Update unread count locally for this conversation
        setConversations(prev => prev.map(c => 
            c.partner.id === userId ? { ...c, unreadCount: 0 } : c
        ));
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  };

  // Change conversation
  const handleSelectConversation = (userId: string) => {
      setSelectedUserId(userId);
      fetchMessages(userId);
      setIsNewChatModalOpen(false);
      
      // Emit 'read' for any unread messages from this user (logic simplified - the API handles mass update, but socket can trigger UI sync)
      const unreadMsgs = messages.filter(m => m.senderId === userId && !m.isRead);
      unreadMsgs.forEach(msg => {
          socketRef.current?.emit('message:read', { messageId: msg.id, senderId: userId });
      });
  };

  const sendMessage = async () => {
    if (!newMessageText.trim() || !selectedUserId) return;

    const tempId = Date.now().toString(); // Optimistic ID
    const optimisticMessage: Message = {
        id: tempId,
        content: newMessageText,
        senderId: user?.id || "me",
        receiverId: selectedUserId,
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: { 
            id: user?.id || "me", 
            firstName: user?.firstName || "Me", 
            lastName: user?.lastName || "", 
            role: "STUDENT", 
            avatarUrl: user?.image || null, 
            image: user?.image || null 
        } 
    };

    // Optimistic update
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessageText("");
    
    // Update conversation list optimistically
    setConversations(prev => {
        const exists = prev.find(c => c.partner.id === selectedUserId);
        if (exists) {
             const updated = {
                  ...exists,
                  lastMessage: {
                      content: optimisticMessage.content,
                      createdAt: optimisticMessage.createdAt,
                      isRead: false,
                      amISender: true
                  },
                  unreadCount: 0
              };
              return [updated, ...prev.filter(c => c.partner.id !== selectedUserId)];
        }
        return prev;
    });

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUserId,
          content: optimisticMessage.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const savedMessage = data.data;
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => m.id === tempId ? savedMessage : m));
        
        // Ensure conversation list is accurate
        fetchConversations(false);
      } else {
        // Revert on failure
        setMessages(prev => prev.filter(m => m.id !== tempId));
        console.error("Failed to send message");
      }
    } catch (error) {
       setMessages(prev => prev.filter(m => m.id !== tempId));
       console.error("Error sending message", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPartnerName = () => {
      const conv = conversations.find(c => c.partner.id === selectedUserId);
      if (conv) return `${conv.partner.firstName} ${conv.partner.lastName}`;
      // Fallback if starting new chat but not in list yet (though usually we'd add it)
      // For now simple fallback
      return "Chat"; 
  };
  
  const getPartnerAvatar = () => {
       const conv = conversations.find(c => c.partner.id === selectedUserId);
       return conv?.partner.avatarUrl || conv?.partner.image || "";
  };
  
  const getPartnerRole = () => {
      const conv = conversations.find(c => c.partner.id === selectedUserId);
      return conv?.partner.role || "";
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
      if (activeFilter === 'unread') return c.unreadCount > 0;
      return true;
  });

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white h-screen flex flex-col antialiased transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-[1440px]">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                <span className="material-symbols-outlined text-[20px]">
                  school
                </span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
                German Virtual School
              </h2>
            </div>
            {/* Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                href="/student/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                href="/student/assignments"
              >
                Assignments
              </Link>
              <Link
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                href="/student/reports"
              >
                Reports
              </Link>
              <Link
                className="text-primary font-medium text-sm"
                href="/messages"
              >
                Messages
              </Link>
              <Link
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                href="/settings"
              >
                Settings
              </Link>
            </nav>
            {/* Profile Actions */}
            <div className="flex items-center gap-4">
              <button className="text-slate-500 dark:text-slate-400 hover:text-primary">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {user?.firstName || 'Student'}
                  </p>
                  <p className="text-[10px] text-slate-500">Student</p>
                </div>
                <Link
                  href="/profile"
                  className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-surface-dark cursor-pointer shadow-sm bg-gray-200 block"
                  style={{
                    backgroundImage: user?.image ? `url('${user.image}')` : undefined,
                  }}
                >
                    {!user?.image && <span className="flex items-center justify-center h-full text-slate-500 font-bold">{user?.firstName?.charAt(0) || 'S'}</span>}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Thread List + Chat Window */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* New Chat Modal */}
        {isNewChatModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">New Conversation</h3>
                        <button 
                            onClick={() => setIsNewChatModalOpen(false)}
                            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    {/* Search Input */}
                    <div className="p-4 pb-2">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                            </div>
                            <input
                                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none text-sm shadow-sm"
                                placeholder="Search for someone..."
                                type="text"
                                value={contactsSearch}
                                onChange={(e) => handleContactsSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoadingContacts ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : faculty.length === 0 && students.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No contacts found.</div>
                        ) : (
                            <>
                                {/* Faculty Section */}
                                {faculty.length > 0 && (
                                    <div className="p-2">
                                        <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Faculty ({faculty.length})
                                        </div>
                                        {faculty.map(contact => (
                                            <button
                                                key={contact.id}
                                                onClick={() => handleSelectConversation(contact.id)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                                            >
                                                <div
                                                    className="size-10 rounded-full bg-cover bg-center bg-gray-200"
                                                    style={{ backgroundImage: contact.avatarUrl || contact.image ? `url('${contact.avatarUrl || contact.image}')` : undefined }}
                                                >
                                                    {!(contact.avatarUrl || contact.image) && (
                                                        <div className="size-full flex items-center justify-center text-slate-500 font-bold">
                                                            {contact.firstName[0]}{contact.lastName[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                        {contact.firstName} {contact.lastName}
                                                    </h4>
                                                    <p className="text-xs text-primary uppercase font-bold tracking-wider">
                                                        {contact.role}
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">chevron_right</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {/* Students Section */}
                                {students.length > 0 && (
                                    <div className="p-2">
                                        <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Students
                                        </div>
                                        {students.map(contact => (
                                            <button
                                                key={contact.id}
                                                onClick={() => handleSelectConversation(contact.id)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                                            >
                                                <div
                                                    className="size-10 rounded-full bg-cover bg-center bg-gray-200"
                                                    style={{ backgroundImage: contact.avatarUrl || contact.image ? `url('${contact.avatarUrl || contact.image}')` : undefined }}
                                                >
                                                    {!(contact.avatarUrl || contact.image) && (
                                                        <div className="size-full flex items-center justify-center text-slate-500 font-bold">
                                                            {contact.firstName[0]}{contact.lastName[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                        {contact.firstName} {contact.lastName}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                                        {contact.role}
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">chevron_right</span>
                                            </button>
                                        ))}
                                        {/* Load More Button */}
                                        {contactsPage < contactsTotalPages && (
                                            <button
                                                onClick={loadMoreStudents}
                                                disabled={isLoadingMoreStudents}
                                                className="w-full py-3 mt-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium disabled:opacity-50"
                                            >
                                                {isLoadingMoreStudents ? 'Loading...' : 'Load More Students'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Thread List (Left Pane) */}
        <div className={`w-full md:w-96 flex-shrink-0 bg-background-light dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200 ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          {/* Search & Header */}
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Messages
                </h2>
                <button 
                    onClick={openNewChatModal}
                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                    title="New Message"
                >
                    <span className="material-symbols-outlined text-[20px]">add_comment</span>
                </button>
            </div>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">
                  search
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none text-sm shadow-sm"
                placeholder="Search conversations..."
                type="text"
              />
            </div>
          </div>
          {/* Tabs */}
          <div className="px-4 mt-2">
            <div className="flex border-b border-slate-200 dark:border-slate-700 gap-6">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`pb-3 border-b-2 font-semibold text-sm transition-colors ${activeFilter === 'all' ? 'border-primary text-primary dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter('unread')}
                className={`pb-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeFilter === 'unread' ? 'border-primary text-primary dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Unread
                {conversations.reduce((acc, curr) => acc + curr.unreadCount, 0) > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {conversations.reduce((acc, curr) => acc + curr.unreadCount, 0)}
                    </span>
                )}
              </button>
            </div>
          </div>
          {/* List Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
             {isLoadingConversations ? (
                 <div className="p-4 text-center text-slate-500">Loading...</div>
             ) : filteredConversations.length === 0 ? (
                 <div className="p-4 text-center text-slate-500">
                     {activeFilter === 'unread' ? 'No unread messages.' : 'No conversations found.'}
                 </div>
             ) : (
                 filteredConversations.map((conv) => (
                    <div 
                        key={conv.partner.id}
                        onClick={() => handleSelectConversation(conv.partner.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedUserId === conv.partner.id ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
                    >
                        <div className="relative flex-shrink-0">
                            <div
                            className="size-12 rounded-full bg-cover bg-center bg-gray-200"
                            style={{ backgroundImage: conv.partner.avatarUrl || conv.partner.image ? `url('${conv.partner.avatarUrl || conv.partner.image}')` : undefined }}
                            >
                                {!(conv.partner.avatarUrl || conv.partner.image) && (
                                    <div className="size-full flex items-center justify-center text-slate-500 font-bold">
                                        {conv.partner.firstName[0]}{conv.partner.lastName[0]}
                                    </div>
                                )}
                            </div>
                            {/* Online status could be here if we had it */}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {conv.partner.firstName} {conv.partner.lastName}
                            </h3>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            </div>
                            <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                            {conv.lastMessage.amISender ? 'You: ' : ''}{conv.lastMessage.content}
                            </p>
                        </div>
                        {conv.unreadCount > 0 && (
                            <div className="size-2.5 rounded-full bg-primary flex-shrink-0"></div>
                        )}
                    </div>
                 ))
             )}
          </div>
        </div>
        {/* Chat Window (Right Pane) */}
        <div className={`flex-1 flex flex-col h-full bg-white dark:bg-slate-900 relative transition-colors duration-200 ${selectedUserId ? 'flex w-full' : 'hidden md:flex'}`}>
          {!selectedUserId ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                  <p>Select a conversation to start chatting.</p>
              </div>
          ) : (
            <>
                {/* Chat Header */}
                <header className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 shrink-0 z-10 transition-colors duration-200">
                    <div className="flex items-center gap-3 md:gap-4">
                      {/* Back Button (Mobile) */}
                      <button 
                        onClick={() => setSelectedUserId(null)}
                        className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                      >
                         <span className="material-symbols-outlined">arrow_back</span>
                      </button>

                      <div className="relative">
                          <div
                          className="size-10 rounded-full bg-cover bg-center bg-gray-200"
                          style={{ backgroundImage: getPartnerAvatar() ? `url('${getPartnerAvatar()}')` : undefined }}
                          ></div>
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900"></span>
                      </div>
                      <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {getPartnerName()}
                          </h2>
                          <p className="text-xs text-primary dark:text-blue-400 font-medium">
                          {getPartnerRole()} • Online
                          </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                    <button
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title="More Options"
                    >
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    </div>
                </header>
                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col gap-6 bg-white dark:bg-slate-900 transition-colors duration-200">
                    {isLoadingMessages && messages.length === 0 ? (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.senderId === user?.id; // Use user from hook
                            // Basic grouping or date separators could be added here by comparing with previous message
                            return (
                                <div key={msg.id} className={`flex gap-3 md:gap-4 max-w-[85%] md:max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : ''}`}>
                                    {!isMe && (
                                        <div
                                            className="size-8 rounded-full bg-cover bg-center flex-shrink-0 self-end mb-1 bg-gray-200"
                                            style={{ backgroundImage: msg.sender.avatarUrl || msg.sender.image ? `url('${msg.sender.avatarUrl || msg.sender.image}')` : undefined }}
                                        ></div>
                                    )}
                                    <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'} px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm`}>
                                            <p>{msg.content}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                                            <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            {isMe && (
                                                 <span className={`material-symbols-outlined text-[14px] ${msg.isRead ? 'text-primary' : 'text-slate-300'}`}>
                                                    {msg.isRead ? 'done_all' : 'done'}
                                                 </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 shrink-0 transition-colors duration-200">
                    <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-end gap-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    {/* Actions */}
                    <div className="flex gap-1 pb-2 pl-1">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                            add_circle
                        </span>
                        </button>
                    </div>
                    {/* Text Area */}
                    <textarea
                        className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 text-sm py-3 px-2 max-h-32 min-h-[44px]"
                        placeholder="Type a message..."
                        rows={1}
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    ></textarea>
                    {/* Send Button */}
                    <button 
                        onClick={sendMessage}
                        className="bg-primary hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors shadow-sm mb-0.5">
                        <span className="material-symbols-outlined text-[20px] block">
                        send
                        </span>
                    </button>
                    </div>
                </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
