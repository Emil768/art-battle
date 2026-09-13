import { loadEnvConfig } from "@next/env";
import type { AppServer, AppSocket } from "@/lib/game/roomState";

// Должно случиться ДО импорта любых наших модулей, которые читают process.env
// на верхнем уровне (например src/lib/game/constants.ts) — иначе они закешируют
// значения по умолчанию ещё до того, как .env.local будет прочитан Next.js.
loadEnvConfig(process.cwd());

const main = async () => {
  const { createServer } = await import("node:http");
  const { default: next } = await import("next");
  const { Server } = await import("socket.io");
  const { createServiceClient } = await import("@/lib/supabase/service");
  const {
    currentQueueSocketIds,
    joinQueue,
    leaveQueue,
    leaveQueueBySocket,
    queueStatus,
  } = await import("@/lib/game/matchmaking");
  const {
    createRoom,
    handleChatSend,
    handleCheckActiveRoom,
    handleDisconnect,
    handleDrawingActivity,
    handleLeaveRoom,
    handleRoomJoin,
    handleSubmit,
    handleVote,
    handleVotingDone,
  } = await import("@/lib/game/roomState");

  const dev = process.env.NODE_ENV !== "production";
  const port = Number(process.env.PORT ?? 3000);

  const app = next({ dev });
  const handle = app.getRequestHandler();

  await app.prepare();

  const httpServer = createServer((req, res) => handle(req, res));

  const io: AppServer = new Server(httpServer, {
    cors: { origin: dev ? "*" : undefined },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.accessToken as string | undefined;
    if (!token) return next(new Error("unauthorized"));

    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return next(new Error("unauthorized"));

    socket.data.userId = data.user.id;
    next();
  });

  io.on("connection", (socket: AppSocket) => {
    socket.on("queue:join", () => {
      const batch = joinQueue(socket.data.userId, socket.id);
      if (batch) {
        createRoom(io, batch).catch((err) => console.error("[server] createRoom failed", err));
        return;
      }
      const status = queueStatus();
      for (const socketId of currentQueueSocketIds()) {
        io.to(socketId).emit("queue:status", status);
      }
    });

    socket.on("queue:leave", () => {
      leaveQueue(socket.data.userId);
    });

    socket.on("room:join", ({ roomId }) => {
      handleRoomJoin(io, socket, roomId).catch((err) =>
        console.error("[server] handleRoomJoin failed", err),
      );
    });

    socket.on("drawing:submit", ({ roomId, imageUrl, isCanvas }, ack) => {
      handleSubmit(io, socket, roomId, imageUrl, isCanvas)
        .then((result) => ack?.(result))
        .catch((err) => {
          console.error("[server] handleSubmit failed", err);
          ack?.({ ok: false, reason: "submit_failed" });
        });
    });

    socket.on("drawing:activity", ({ roomId }) => {
      handleDrawingActivity(io, socket, roomId);
    });

    socket.on("voting:vote", ({ roomId, targetUserId, value }) => {
      handleVote(io, socket, roomId, targetUserId, value).catch((err) =>
        console.error("[server] handleVote failed", err),
      );
    });

    socket.on("voting:done", ({ roomId }) => {
      handleVotingDone(io, socket, roomId);
    });

    socket.on("chat:send", ({ roomId, text }) => {
      handleChatSend(io, socket, roomId, text).catch((err) =>
        console.error("[server] handleChatSend failed", err),
      );
    });

    socket.on("lobby:check_active_room", () => {
      handleCheckActiveRoom(socket);
    });

    socket.on("room:leave", ({ roomId }) => {
      handleLeaveRoom(socket, roomId);
    });

    socket.on("disconnect", () => {
      leaveQueueBySocket(socket.id);
      handleDisconnect(socket);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Art Battle ready on http://localhost:${port} (ROOM_SIZE=${process.env.ROOM_SIZE ?? 5})`);
  });
};

main();
