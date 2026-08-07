import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { authStorage } from "../services/authStorage";

// Backend base URL without the trailing "/api" — Socket.IO connects at the
// server root, not under the REST API path. Default port matches the API
// client (5001) so realtime events actually connect in local dev.
const SOCKET_URL = (import.meta.env.VITE_API_URL //|| "http://localhost:5001/api").replace(/\/api\/?$/, "")
|| "https://made-over-tiramisu-backend.vercel.app/api").replace(/\/api\/?$/, "")

// One shared connection for the whole admin session — every page that
// subscribes reuses it instead of opening a new socket per tab/page.
let sharedSocket: Socket | null = null;

function getAdminSocket(): Socket {
  if (!sharedSocket) {
    // Authenticate the connection with the admin JWT so the backend can
    // reject anonymous socket connections (handshake auth, ignored by
    // backends that don't check it).
    sharedSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { token: authStorage.getToken() },
    });
  }
  return sharedSocket;
}

/**
 * Closes and forgets the shared admin socket. Call on logout so a
 * logged-out browser stops receiving admin change events immediately,
 * instead of the socket lingering until the tab closes.
 */
export function disconnectAdminSocket() {
  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }
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
