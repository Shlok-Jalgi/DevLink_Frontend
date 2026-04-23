"use client";
import { useEffect, useState, use } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ChatBubbleLeftEllipsisIcon as MessageSquare,
  ArrowUpCircleIcon as ArrowBigUp,
  ArrowDownCircleIcon as ArrowBigDown,
  ClockIcon as Clock,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function QuestionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [question, setQuestion] = useState<any>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchQuestion = async () => {
    try {
      const res = await api.get(`/questions/${id}`);
      setQuestion(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQuestion();
  }, [id]);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Log in to post an answer");
    try {
      await api.post("/answers", { questionId: id, content: answerContent });
      setAnswerContent("");
      fetchQuestion(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (answerId: string, type: "upvote" | "downvote") => {
    if (!user) return alert("Log in to vote");
    try {
      await api.post(`/answers/${answerId}/vote`, { type });
      fetchQuestion(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="text-center p-20 text-gray-500 font-medium">
        Loading discussion...
      </div>
    );
  if (!question)
    return (
      <div className="text-center p-20 text-red-500 font-bold text-xl">
        Question not found
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 text-left">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          {question.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              Asked{" "}
              {formatDistanceToNow(new Date(question.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">by</span>
            <Link
              href={`/profile/${question.userId._id}`}
              className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {question.userId.name}
            </Link>
            <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold text-xs border border-blue-100">
              {question.userId.reputation} rep
            </span>
          </div>
        </div>
        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap font-mono text-[15px] bg-[#f8fafc] p-8 rounded-2xl border border-gray-200">
          {question.description}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {question.tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="bg-slate-100 border border-slate-200 text-slate-700 text-sm px-4 py-1.5 rounded-full font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-blue-500" />
          {question.answers?.length || 0} Answers
        </h2>
      </div>

      <div className="space-y-6 mb-12">
        {question.answers
          ?.sort((a: any, b: any) => b.votes - a.votes)
          .map((ans: any) => (
            <div
              key={ans._id}
              className="bg-white rounded-3xl flex border border-gray-100 shadow-sm overflow-hidden group hover:border-blue-200 transition-colors"
            >
              <div className="bg-gray-50/80 w-24 flex flex-col items-center py-6 border-r border-gray-100">
                <button
                  onClick={() => handleVote(ans._id, "upvote")}
                  className="text-gray-300 hover:text-green-500 hover:bg-green-50 p-2.5 rounded-full transition-all mb-2"
                >
                  <ArrowBigUp className="w-9 h-9" />
                </button>
                <span
                  className={`text-2xl font-black ${ans.votes > 0 ? "text-green-600" : ans.votes < 0 ? "text-red-500" : "text-gray-400"}`}
                >
                  {ans.votes}
                </span>
                <button
                  onClick={() => handleVote(ans._id, "downvote")}
                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all mt-2"
                >
                  <ArrowBigDown className="w-9 h-9" />
                </button>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between text-left">
                <div className="prose max-w-none text-gray-800 whitespace-pre-wrap mb-6 font-mono text-[15px] leading-relaxed">
                  {ans.content}
                </div>
                <div className="text-sm text-gray-500 flex justify-end">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm">
                      {ans.userId?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium">
                        Answered by{" "}
                        <Link
                          href={`/profile/${ans.userId?._id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {ans.userId?.name || "Unknown"}
                        </Link>
                      </span>
                      <span className="text-[11px] font-medium text-gray-400">
                        {formatDistanceToNow(new Date(ans.createdAt))} ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          Your Answer
        </h3>
        {user ? (
          <form onSubmit={handlePostAnswer}>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              required
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-mono text-[15px] h-40 mb-4 bg-gray-50 focus:bg-white"
              placeholder="Write your answer here. Provide code examples or explanations..."
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 w-full sm:w-auto"
            >
              Post Your Answer
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200 border-dashed">
            <p className="text-gray-600 mb-6 font-medium text-lg">
              Join the conversation by logging in
            </p>
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
            >
              Sign In to Answer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
