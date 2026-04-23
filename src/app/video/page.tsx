"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  VideoCameraIcon as Video,
  GlobeAltIcon as Globe,
  UsersIcon as Users,
  CheckCircleIcon as CheckCircle2,
  PhoneIcon as PhoneCall,
  PhoneArrowUpRightIcon as PhoneForwarded,
  XMarkIcon as X,
  CheckIcon as Check,
} from "@heroicons/react/24/outline";
import { io, Socket } from "socket.io-client";

interface OnlineUser {
  userId: string;
  name: string;
  status: "available" | "calling" | "receiving" | "in-call";
}

interface CallRequest {
  callerId: string;
  callerName: string;
}

export default function VideoMatchmaker() {
  const { user } = useAuth();
  const router = useRouter();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [incomingCall, setIncomingCall] = useState<CallRequest | null>(null);
  const [callingUser, setCallingUser] = useState<string | null>(null);

  useEffect(() => {
    // Request camera access for preview
    const getMedia = async () => {
      try {
        const ms = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(ms);
        if (videoRef.current) {
          videoRef.current.srcObject = ms;
        }
      } catch (err) {
        console.error("Failed to get local stream", err);
      }
    };
    getMedia();

    return () => {
      // Cleanup preview tracks
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return;
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
    const backendUrl =
      NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`;
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("register_user", { userId: user._id, name: user.name });
    });

    newSocket.on("online_users_update", (users: OnlineUser[]) => {
      setOnlineUsers(users.filter((u) => u.userId !== user._id));
    });

    newSocket.on("incoming_call", (data: CallRequest) => {
      setIncomingCall(data);
    });

    newSocket.on("call_accepted", (data: { responderId: string }) => {
      stream?.getTracks().forEach((track) => track.stop());
      router.push(`/video/room?partnerId=${data.responderId}&initiator=true`);
    });

    newSocket.on("call_declined", () => {
      alert("Call declined.");
      setCallingUser(null);
    });

    newSocket.on("call_error", (data: { message: string }) => {
      alert(data.message);
      setCallingUser(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequestCall = (targetUserId: string) => {
    if (!socket || !user) return;
    setCallingUser(targetUserId);
    socket.emit("request_call", {
      targetUserId,
      callerId: user._id,
      callerName: user.name,
    });
  };

  const handleAcceptCall = () => {
    if (!socket || !user || !incomingCall) return;
    socket.emit("accept_call", {
      targetUserId: incomingCall.callerId,
      responderId: user._id,
    });
    stream?.getTracks().forEach((track) => track.stop());
    router.push(
      `/video/room?partnerId=${incomingCall.callerId}&initiator=false`,
    );
  };

  const handleDeclineCall = () => {
    if (!socket || !user || !incomingCall) return;
    socket.emit("decline_call", {
      targetUserId: incomingCall.callerId,
      responderId: user._id,
    });
    setIncomingCall(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-8 relative">
      {/* INCOMING CALL MODAL */}

      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center border border-indigo-100">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
              <PhoneCall className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {incomingCall.callerName}
            </h3>
            <p className="text-gray-500 mb-8 font-medium">
              is requesting a video call...
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeclineCall}
                className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <X className="w-8 h-8" />
              </button>
              <button
                onClick={handleAcceptCall}
                className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 shadow-green-500/30"
              >
                <Check className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
          Selective Video Calling
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          See who's online and request a direct 1-on-1 video call.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* LEFT: Camera Preview */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xl shadow-gray-200/50 text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" /> Camera Preview
          </h2>
          <div className="bg-gray-900 aspect-video rounded-2xl overflow-hidden relative shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
            ></video>
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium text-sm">
                Requesting camera access...
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Online Users List */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xl shadow-gray-200/50 text-left h-[500px] flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Online Developers
          </h2>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {onlineUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Globe className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">
                  No other developers are online right now.
                </p>
              </div>
            ) : (
              onlineUsers.map((u) => (
                <div
                  key={u.userId}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-gray-900">{u.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${u.status === "available" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-yellow-500 shadow-[0_0_8px_#eab308]"}`}
                      ></div>
                      <span className="text-xs font-semibold text-gray-500 capitalize">
                        {u.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRequestCall(u.userId)}
                    disabled={
                      u.status !== "available" || callingUser === u.userId
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${u.status !== "available"
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : callingUser === u.userId
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 shadow-md shadow-indigo-500/20"
                      }`}
                  >
                    {callingUser === u.userId ? (
                      "Calling..."
                    ) : (
                      <>
                        <PhoneForwarded className="w-4 h-4" /> Request Call
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
