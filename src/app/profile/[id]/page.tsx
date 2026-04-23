"use client";
import { useEffect, useState, use } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  bio: string;
  reputation: number;
  createdAt: string;
}

export default function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isOwner = user?._id === id;

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", bio: "", skills: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setProfile(res.data);
        setFormData({
          name: res.data.name,
          bio: res.data.bio || "",
          skills: res.data.skills.join(", "),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put(`/users/${id}`, {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills.split(",").map((s) => s.trim()),
      });
      setProfile(res.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading profile...</div>
    );
  if (!profile)
    return <div className="p-8 text-center text-red-500">User not found!</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-500 mt-1">{profile.email}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {profile.reputation}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Reputation
            </div>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleUpdate} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
                rows={3}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Bio
              </h3>
              <p className="mt-2 text-gray-700">
                {profile.bio || "No bio provided."}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Skills
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
