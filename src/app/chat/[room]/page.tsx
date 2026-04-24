"use client";
import { useEffect, useState, useRef, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";
import {
  PaperAirplaneIcon as Send,
  HashtagIcon as Hash,
  UsersIcon as Users,
  CodeBracketIcon as Code2,
} from "@heroicons/react/24/outline";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-twilight.css"; // Requires layout to load properly, but acceptable here
import api from "@/lib/api";

interface Message {
  _id?: string;
  senderId: string | any;
  message: string;
  timestamp: string;
}

export default function ChatRoom({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = use(params);
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return; // Wait for login

    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
    const backendUrl = NEXT_PUBLIC_API_URL || "https://devlink-backend-dnk0.onrender.com";
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_room", room);
    });

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${room}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    };
    fetchHistory();

    newSocket.on("receive_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [room, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!socket || !user) return;

    let finalMessage = inputMessage.trim();
    if (showCodeEditor && codeSnippet.trim()) {
      finalMessage += `\n\`\`\`javascript\n${codeSnippet}\n\`\`\``;
    }

    if (!finalMessage) return;

    const data = {
      room,
      senderId: user._id,
      message: finalMessage,
    };

    socket.emit("send_message", data);
    setInputMessage("");
    setCodeSnippet("");
    setShowCodeEditor(false);
  };

  if (!user)
    return (
      <div className="text-center p-20 text-gray-500 font-medium">
        Please login to join the chat.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col md:flex-row shadow-sm bg-gray-50">
      {/* Sidebar Info */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner uppercase">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg uppercase tracking-wider truncate w-32">
              {room}
            </h2>
            <p className="text-xs text-green-500 font-bold flex items-center gap-1">
              <Users className="w-3 h-3" /> Online
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          Share snippets, solve bugs, and collaborate in real-time.
        </p>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              No messages yet. Say hi!
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe =
              msg.senderId?._id === user._id || msg.senderId === user._id;
            const senderName =
              msg.senderId?.name || (isMe ? user.name : "Unknown");

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-6 py-4 shadow-sm ${isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-900 rounded-tl-sm"}`}
                >
                  <div
                    className={`text-xs font-bold mb-1 opacity-70 ${isMe ? "text-blue-100 text-right" : "text-gray-500"}`}
                  >
                    {senderName}
                  </div>
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">
                    {msg.message.split("```").map((part, index) => {
                      if (index % 2 !== 0) {
                        const codeLines = part
                          .replace(/^javascript\n/, "")
                          .trim();
                        return (
                          <pre
                            key={index}
                            className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl my-3 overflow-x-auto text-[13px] font-mono shadow-inner border border-gray-800"
                          >
                            <code>{codeLines}</code>
                          </pre>
                        );
                      }
                      return <span key={index}>{part}</span>;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-100 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          {showCodeEditor && (
            <div className="mb-4 border border-gray-200 rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-500">
                <span className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> JAVASCRIPT EDITOR
                </span>
                <button
                  onClick={() => setShowCodeEditor(false)}
                  className="hover:text-red-500 bg-white border border-gray-200 px-3 py-1 rounded-full cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="bg-[#2d2d2d] p-4">
                <Editor
                  value={codeSnippet}
                  onValueChange={(code) => setCodeSnippet(code)}
                  highlight={(code) =>
                    Prism.highlight(
                      code,
                      Prism.languages.javascript,
                      "javascript",
                    )
                  }
                  padding={0}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 14,
                    minHeight: "150px",
                    color: "#ccc",
                  }}
                  textareaClassName="focus:outline-none"
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-2 relative">
            <button
              type="button"
              onClick={() => setShowCodeEditor(!showCodeEditor)}
              className={`p-4 rounded-2xl transition-colors ${showCodeEditor ? "bg-blue-100 text-blue-600" : "bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100"}`}
              title="Attach Code Snippet"
            >
              <Code2 className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
            />
            <button
              type="submit"
              className="px-6 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center font-bold gap-2"
            >
              Send <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
