"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon as Search } from "@heroicons/react/24/outline";

export default function SmartSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        try {
          const res = await api.get(`/questions/search/similar?q=${query}`);
          setResults(res.data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto text-left">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border-0 rounded-full leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 sm:text-lg shadow-xl shadow-blue-900/10 transition-shadow"
          placeholder="Ask a question or search for topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden text-left origin-top animate-in fade-in slide-in-from-top-2">
          <ul className="max-h-80 overflow-auto py-2">
            {results.map((q) => (
              <li
                key={q._id}
                onClick={() => router.push(`/question/${q._id}`)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 block"
              >
                <div className="font-bold text-gray-900">{q.title}</div>
                <div className="text-sm text-gray-500 truncate mt-1">
                  {q.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
