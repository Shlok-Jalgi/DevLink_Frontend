"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import SmartSearch from "@/components/SmartSearch";
import {
  ChatBubbleLeftEllipsisIcon as MessageSquare,
  VideoCameraIcon as Video,
  CodeBracketIcon as Code2,
} from "@heroicons/react/24/outline";

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get("/questions");
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white py-24 px-4 text-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://api.test/noise')] opacity-5 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Learn, Share,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Connect.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-200/80 mb-12 max-w-2xl mx-auto">
            The ultimate platform for developers to solve problems
            collaboratively with AI assistance, real-time code chat, and WebRTC
            video matchmaking.
          </p>
          <div>
            <SmartSearch />
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-4">
            <Link
              href="/ask"
              className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold shadow-xl hover:bg-gray-50 transition-all hover:-translate-y-1 flex items-center gap-2"
            >
              <Code2 className="w-5 h-5" /> Post a Question
            </Link>
            <Link
              href="/chat"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold shadow-xl hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" /> Join Chat Rooms
            </Link>
            <Link
              href="/video"
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border border-indigo-400/50 rounded-full font-bold shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-1 flex items-center gap-2"
            >
              <Video className="w-5 h-5" /> Video Match
            </Link>
          </div>
        </div>
      </section>

      {/* Main Feed */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Community Feed
          </h2>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-bold cursor-pointer">
              Latest
            </span>
            <span className="px-4 py-1.5 rounded-full hover:bg-gray-100 text-gray-600 text-sm font-bold cursor-pointer transition-colors">
              Trending
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-100 animate-pulse h-32"
              ></div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">
              It's a bit quiet here...
            </p>
            <p className="mt-1">Be the first to post a new question!</p>
            <Link
              href="/ask"
              className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Ask Question
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <div
                key={q._id}
                className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <Link href={`/question/${q._id}`} className="block">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {q.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mt-3 line-clamp-2 text-lg">
                  {q.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {q.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold tag-hover"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                      {q.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">
                        Asked by
                      </span>
                      <Link
                        href={`/profile/${q.userId._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {q.userId.name}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
