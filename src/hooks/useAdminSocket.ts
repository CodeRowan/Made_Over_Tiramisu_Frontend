import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Backend base URL without the trailing "/api" — Socket.IO connects at the
// server root, not under the REST API path.
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

// One shared connection for the whole admin session — every page that
// subscribes reuses it instead of opening a new socket per tab/page.
let sharedSocket: Socket | null = null;

function getAdminSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
  }
  return sharedSocket;
}

/**
 * Subscribes to one or more "<resource>:changed" realtime events for as
 * long as the calling component is mounted, so admin pages refresh live
 * when data changes — including changes made from a different browser or
 * by a different admin — instead of needing a manual reload.
 *
 * `onUpdate` is always called with its latest closure, but the socket
 * subscription itself is only set up once per mount (keyed by the event
 * list), so passing an inline arrow function each render is safe.
 */
export function useRealtimeUpdates(events: string[], onUpdate: () => void) {
  const handlerRef = useRef(onUpdate);
  handlerRef.current = onUpdate;

  const eventsKey = events.join(",");

  useEffect(() => {
    const socket = getAdminSocket();
    const wrapped = () => handlerRef.current();
    events.forEach((event) => socket.on(event, wrapped));
    return () => {
      events.forEach((event) => socket.off(event, wrapped));
    };
    // eventsKey is the real dependency — events is re-created each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsKey]);
}
