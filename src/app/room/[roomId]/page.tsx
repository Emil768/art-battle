"use client";

import { use } from "react";
import { WaitingRoom } from "@/components/room/WaitingRoom";
import { DrawingPhase } from "@/components/room/DrawingPhase";
import { VotingPhase } from "@/components/room/VotingPhase";
import { ResultsPhase } from "@/components/room/ResultsPhase";
import { StatusBanner } from "@/components/shared/StatusBanner";
import { useRoomPage } from "./hooks/useRoomPage";

const RoomPage = ({ params }: { params: Promise<{ roomId: string }> }) => {
  const { roomId } = use(params);
  const {
    socket,
    userId,
    roomState,
    voteProgress,
    votingPayload,
    results,
    errorMsg,
    submittedPlayerIds,
  } = useRoomPage(roomId);

  if (!socket || !roomState || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--ab-bg)" }}>
        <span
          className="rounded-full px-6 py-3 font-extrabold"
          style={{ background: "var(--ab-surface)", border: "2px solid var(--ab-line-soft)", color: "var(--ab-ink)" }}
        >
          Загрузка...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--ab-bg)" }}>
      {errorMsg && (
        <div className="mx-auto mt-4 flex max-w-4xl justify-center">
          <StatusBanner variant="error" message={errorMsg} />
        </div>
      )}

      {roomState.status === "waiting" && (
        <WaitingRoom players={roomState.players} ownUserId={userId} />
      )}

      {roomState.status === "drawing" && roomState.drawingEndsAt && roomState.promptText && (
        <DrawingPhase
          socket={socket}
          roomId={roomId}
          promptText={roomState.promptText}
          drawingEndsAt={roomState.drawingEndsAt}
          players={roomState.players}
          submittedPlayerIds={submittedPlayerIds}
        />
      )}

      {roomState.status === "voting" && votingPayload && (
        <VotingPhase
          socket={socket}
          roomId={roomId}
          promptText={roomState.promptText ?? ""}
          players={roomState.players}
          votingEndsAt={votingPayload.votingEndsAt}
          submissions={votingPayload.submissions}
          votedCount={voteProgress.votedCount}
          totalCount={voteProgress.totalCount || roomState.players.length}
        />
      )}

      {roomState.status === "finished" && results && (
        <ResultsPhase results={results} ownUserId={userId} />
      )}
    </main>
  );
};

export default RoomPage;
