"use client";
import Link from "next/link";
import {
  ChatBubbleLeftEllipsisIcon as MessageSquare,
  CodeBracketIcon as Code,
  CpuChipIcon as Cpu,
  GlobeAltIcon as Globe,
  ServerStackIcon as Database,
  DevicePhoneMobileIcon as Smartphone,
} from "@heroicons/react/24/outline";

const rooms = [
  {
    id: "web-dev",
    name: "Web Development",
    icon: Globe,
    color: "bg-blue-500",
    members: "120+",
  },
  {
    id: "java",
    name: "Java Basics",
    icon: Code,
    color: "bg-orange-500",
    members: "85+",
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    icon: Cpu,
    color: "bg-purple-500",
    members: "240+",
  },
  {
    id: "database",
    name: "Databases (SQL/NoSQL)",
    icon: Database,
    color: "bg-emerald-500",
    members: "65+",
  },
  {
    id: "mobile",
    name: "Mobile App Dev",
    icon: Smartphone,
    color: "bg-pink-500",
    members: "90+",
  },
  {
    id: "general",
    name: "General Chat",
    icon: MessageSquare,
    color: "bg-gray-500",
    members: "300+",
  },
];

export default function ChatRooms() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Topic Chat Rooms
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Join a live room to discuss topics, share code snippets with real-time
          syntax highlighting, and collaborate with other developers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, idx) => (
          <div key={room.id}>
            <Link href={`/chat/${room.id}`} className="block group h-full">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-left flex flex-col items-start h-full relative overflow-hidden">
                <div
                  className={`w-14 h-14 rounded-2xl ${room.color} text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}
                >
                  <room.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {room.name}
                </h3>
                <p className="text-sm font-semibold text-gray-500 mt-auto">
                  Active Members
                </p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
