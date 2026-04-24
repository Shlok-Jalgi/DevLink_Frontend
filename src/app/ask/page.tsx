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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ask a Question
          </h1>
          <p className="text-gray-500 mb-8">
            Be specific and imagine you're asking a question to another person.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-900 text-lg shadow-sm"
                placeholder="e.g. How to center a div in Tailwind?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-900 font-mono text-sm h-48 shadow-sm"
                placeholder="Provide details, code snippets, or error messages..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-900 shadow-sm"
                placeholder="react, css, javascript (comma separated)"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 w-full justify-center md:w-auto"
              >
                <Send className="w-4 h-4" /> Post Question
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* <div className="md:col-span-1 space-y-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-indigo-100">
          <div className="flex items-center gap-3 mb-4 text-indigo-900">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <h3 className="font-bold text-lg">AI Assistant</h3>
          </div>
          <p className="text-sm text-indigo-800/80 mb-6 font-medium">
            Get instant help before posting your question. Our AI can analyze
            your text and provide immediate feedback.
          </p>
          <button
            type="button"
            onClick={handleAskAI}
            disabled={loading || !title}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {loading ? "Analyzing..." : "Ask AI"}
          </button>
        </div>

        {aiAnswer && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl overflow-hidden">
            {aiAnswer.type === "existing_db" ? (
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Similar Question Found!
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Someone has already asked something very similar.
                </p>
                <button
                  onClick={() =>
                    router.push(`/question/${aiAnswer.question._id}`)
                  }
                  className="text-blue-600 font-medium hover:underline flex items-center gap-1 text-sm"
                >
                  View Question &rarr;
                </button>
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> AI Response
                </h4>
                <div className="prose prose-sm prose-indigo max-w-none text-gray-700 whitespace-pre-wrap font-medium">
                  {aiAnswer.answer}
                </div>
              </div>
            )}
          </div>
        )}
      </div> */}
    </div>
  );
}
