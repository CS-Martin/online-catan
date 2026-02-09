import { defineSchema } from "convex/server";
import { users } from "./users/user.model";
import { lobbies } from "./lobbies/lobby.model";
import { lobbyPlayers } from "./lobbies/lobbyPlayer.model";
import { games } from "./games/game.model";
import { gamePlayers } from "./games/gamePlayer.model";
import { tradeOffers } from "./trades/tradeOffer.model";
import { bankTrades } from "./trades/bankTrade.model";
import { robberPositions } from "./robber/robberPosition.model";
import { gameLogs } from "./gameLogs/gameLog.model";
import { gameStatistics } from "./stats/gameStatistics.model";

export default defineSchema({
  users,
  lobbies,
  lobbyPlayers,
  games,
  gamePlayers,
  tradeOffers,
  bankTrades,
  robberPositions,
  gameLogs,
  gameStatistics,
});
