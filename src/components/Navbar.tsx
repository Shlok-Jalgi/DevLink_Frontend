"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-extrabold text-2xl tracking-tighter text-blue-600 dark:text-blue-400"
        >
          DevLink
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/ask"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Ask AI
          </Link>
          <Link
            href="/chat"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Chat Rooms
          </Link>
          <Link
            href="/video"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Video Match
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href={`/profile/${user._id}`}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"
              >
                {user.name}{" "}
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold ml-1">
                  {user.reputation}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
