export const getConvexErrorMessage = (error: unknown): string => {
  const fallback = "Something went wrong";

  if (!error) return fallback;

  const raw = error instanceof Error ? error.message : String(error);

  // Convex client errors often include a lot of transport/debug info like:
  // "[CONVEX M(module:function)] [Request ID: ...] Server Error Uncaught Error: <message> at handler ..."
  // We want to show only the human message.

  // Prefer the part after "Uncaught Error:" if present.
  const uncaughtSplit = raw.split("Uncaught Error:");
  const afterUncaught = uncaughtSplit.length > 1 ? uncaughtSplit[1] : raw;

  // Remove stack/trace parts.
  const beforeTrace = afterUncaught.split(" at handler")[0];
  const beforeCalledBy = beforeTrace.split(" Called by client")[0];

  const cleaned = beforeCalledBy.trim();
  if (!cleaned) return fallback;

  return cleaned;
};

export const getLobbyUserFacingError = (error: unknown): string => {
  const message = getConvexErrorMessage(error);

  // Map common lobby errors to friendlier copy.
  if (message === "All players must be ready to start") {
    return "Everyone must click Ready before you can start.";
  }
  if (message === "All players must select a color to start") {
    return "All players must choose a color before starting.";
  }
  if (message === "Need at least 2 players to start") {
    return "You need at least 2 players to start.";
  }
  if (message === "Lobby is full") {
    return "This lobby is full.";
  }
  if (message === "User is already in this lobby") {
    return "You're already in this lobby.";
  }

  return message;
};
