"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  SparklesIcon as Sparkles,
  ArrowPathIcon as Loader2,
  PaperAirplaneIcon as Send,
} from "@heroicons/react/24/outline";

export default function AskQuestion() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [aiAnswer, setAiAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleAskAI = async () => {
    if (!title) return alert("Please enter a title to ask AI.");
    setLoading(true);
    setAiAnswer(null);
    try {
      const res = await api.post("/ai/ask", {
        question: title + "\n" + description,
      });
      setAiAnswer(res.data);
    } catch (err) {
      console.error(err);
      alert("AI failed to respond.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to post a question.");
      router.push("/login");
      return;
    }

    try {
      const res = await api.post("/questions", {
        title,
        description,
        tags,
      });
      router.push(`/question/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to post question.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8 grid md:grid-cols-4 gap-8 text-left">
  <div className="md:col-span-4">
    {/* Card container with a deep dark background and subtle border */}
    <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        Ask a Question
      </h1>
      <p className="text-gray-400 mb-8">
        Be specific and imagine you're asking a question to another person.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-100 text-lg shadow-inner placeholder-gray-500"
            placeholder="e.g. How to center a div in Tailwind?"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Description
          </label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-100 font-mono text-sm h-48 shadow-inner placeholder-gray-500"
            placeholder="Provide details, code snippets, or error messages..."
          />
        </div>

        {/* Tags Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-100 shadow-inner placeholder-gray-500"
            placeholder="react, css, javascript (comma separated)"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-700">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 w-full justify-center md:w-auto active:scale-95"
          >
            <Send className="w-4 h-4" /> Post Question
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
  );
}
