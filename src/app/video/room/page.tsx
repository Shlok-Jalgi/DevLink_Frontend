"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import {
  VideoCameraIcon as Video,
  MicrophoneIcon as Mic,
  MicrophoneIcon as MicOff,
  VideoCameraSlashIcon as VideoOff,
  PhoneXMarkIcon as PhoneOff,
  ArrowPathIcon as Loader2,
} from "@heroicons/react/24/outline";

function VideoRoomContent() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get("partnerId");
  const initiator = searchParams.get("initiator") === "true";
  const router = useRouter();
  const { user } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState("Initializing...");
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  // Configuration for WebRTC
  const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    if (!user || !partnerId) {
      router.push("/video");
      return;
    }

    let pc: RTCPeerConnection;
    let newSocket: Socket;
    let currentStream: MediaStream | null = null;

    const initConnection = async () => {
      try {
        setStatus("Requesting media access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        currentStream = stream;
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        setStatus("Connecting to server...");
        const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
        const backendUrl = NEXT_PUBLIC_API_URL || "https://devlink-backend-dnk0.onrender.com";
        newSocket = io(backendUrl);
        setSocket(newSocket);

        newSocket.on("connect", () => {
          newSocket.emit("register_user", {
            userId: user._id,
            name: user.name,
          });
          setStatus("Waiting for peer...");

          pc = new RTCPeerConnection(rtcConfig);
          setPeerConnection(pc);

          stream.getTracks().forEach((track) => pc.addTrack(track, stream));

          pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current)
              remoteVideoRef.current.srcObject = event.streams[0];
            setStatus("Connected! Say Hi.");
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              newSocket.emit("webrtc_ice_candidate", {
                targetUserId: partnerId,
                candidate: event.candidate,
                senderId: user._id,
              });
            }
          };

          // Tell the partner we are ready to receive or send offers
          newSocket.emit("webrtc_ready", {
            targetUserId: partnerId,
            userId: user._id,
          });
        });

        // 1. Peer Ready
        let hasOffered = false;

        newSocket.on("peer_ready", async () => {
          if (initiator && pc && !hasOffered) {
            hasOffered = true;
            setStatus("Initiating call...");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            newSocket.emit("webrtc_offer", {
              targetUserId: partnerId,
              sdp: offer,
              senderId: user._id,
            });
          } else if (!initiator) {
            // Acknowledge so the initiator knows we are ready (fixes deadlock if responder joined first)
            newSocket.emit("webrtc_ready_ack", {
              targetUserId: partnerId,
              userId: user._id,
            });
          }
        });

        newSocket.on("peer_ready_ack", async () => {
          if (initiator && pc && !hasOffered) {
            hasOffered = true;
            setStatus("Initiating call...");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            newSocket.emit("webrtc_offer", {
              targetUserId: partnerId,
              sdp: offer,
              senderId: user._id,
            });
          }
        });

        // 2. WebRTC Signaling Handlers
        newSocket.on(
          "webrtc_offer",
          async (data: {
            sdp: RTCSessionDescriptionInit;
            senderId: string;
          }) => {
            if (pc && data.senderId === partnerId) {
              setStatus("Accepting connection...");
              await pc.setRemoteDescription(
                new RTCSessionDescription(data.sdp),
              );
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              newSocket.emit("webrtc_answer", {
                targetUserId: partnerId,
                sdp: answer,
                senderId: user._id,
              });
            }
          },
        );

        newSocket.on(
          "webrtc_answer",
          async (data: {
            sdp: RTCSessionDescriptionInit;
            senderId: string;
          }) => {
            if (pc && data.senderId === partnerId) {
              await pc.setRemoteDescription(
                new RTCSessionDescription(data.sdp),
              );
            }
          },
        );

        newSocket.on(
          "webrtc_ice_candidate",
          async (data: {
            candidate: RTCIceCandidateInit;
            senderId: string;
          }) => {
            if (pc && data.senderId === partnerId) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          },
        );

        newSocket.on("call_ended", () => {
          setStatus("Call ended by partner.");
          setTimeout(() => router.push("/video"), 2000);
        });
      } catch (err) {
        console.error(err);
        setStatus("Failed to access camera/microphone. Check permissions.");
      }
    };

    initConnection();

    return () => {
      currentStream?.getTracks().forEach((track) => track.stop());
      pc?.close();
      if (newSocket) {
        newSocket.emit("end_call", {
          targetUserId: partnerId,
          userId: user._id,
        });
        newSocket.disconnect();
      }
    };
  }, [user, partnerId, initiator]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMic = () => {
    if (localStream) {
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !micEnabled));
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !camEnabled));
      setCamEnabled(!camEnabled);
    }
  };

  const handleLeave = () => {
    if (socket && user)
      socket.emit("end_call", { targetUserId: partnerId, userId: user._id });
    router.push("/video");
  };

  return (
    <div className="bg-gray-950 min-h-[calc(100vh-4rem)] flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center z-10 text-left">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">1-on-1 Video Call</h1>
            <p className="text-xs text-indigo-400 font-bold flex items-center gap-2">
              {status.includes("Waiting") ||
              status.includes("Connecting") ||
              status.includes("Initiating") ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
              )}
              <span className="text-gray-400">{status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Remote Video (Main Focus) */}
        <div className="bg-gray-900 rounded-3xl overflow-hidden relative border border-gray-800 shadow-2xl flex items-center justify-center min-h-[50vh] md:min-h-0">
          {!remoteStream ? (
            <div className="text-gray-500 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-gray-700" />
              <p className="font-medium text-lg text-gray-400">
                Waiting for partner's video...
              </p>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            ></video>
          )}
          <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white text-xs font-bold shadow-xl">
            Partner
          </div>
        </div>

        {/* Local Video */}
        <div className="bg-gray-900 rounded-3xl overflow-hidden relative border border-gray-800 shadow-2xl flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
          ></video>
          <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white text-xs font-bold shadow-xl">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 py-6 px-4 flex justify-center gap-6 z-10">
        <button
          onClick={toggleMic}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg text-white font-bold group border ${micEnabled ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-500"}`}
        >
          {micEnabled ? (
            <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
          ) : (
            <MicOff className="w-7 h-7 group-hover:scale-110 transition-transform" />
          )}
        </button>
        <button
          onClick={toggleCam}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg text-white font-bold group border ${camEnabled ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-500"}`}
        >
          {camEnabled ? (
            <Video className="w-7 h-7 group-hover:scale-110 transition-transform" />
          ) : (
            <VideoOff className="w-7 h-7 group-hover:scale-110 transition-transform" />
          )}
        </button>
        <button
          onClick={handleLeave}
          className="w-24 h-16 bg-red-600 hover:bg-red-700 border border-red-500 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg shadow-red-600/30 text-white font-black text-xs gap-1 hover:-translate-y-0.5"
        >
          <PhoneOff className="w-6 h-6" /> LEAVE
        </button>
      </div>
    </div>
  );
}

export default function VideoRoom() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center text-white bg-gray-950 flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
          <p className="font-bold text-lg">Loading WebRTC Environment...</p>
        </div>
      }
    >
      <VideoRoomContent />
    </Suspense>
  );
}
