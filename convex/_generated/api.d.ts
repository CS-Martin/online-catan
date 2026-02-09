/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as gameLogs_mutations_addLogEntry from "../gameLogs/mutations/addLogEntry.js";
import type * as gameLogs_mutations_index from "../gameLogs/mutations/index.js";
import type * as gameLogs_queries_getGameLogs from "../gameLogs/queries/getGameLogs.js";
import type * as gameLogs_queries_index from "../gameLogs/queries/index.js";
import type * as games_api from "../games/api.js";
import type * as games_lib_boardGeneration from "../games/lib/boardGeneration.js";
import type * as games_mutations_advanceTurn from "../games/mutations/advanceTurn.js";
import type * as games_mutations_buildRoad from "../games/mutations/buildRoad.js";
import type * as games_mutations_buildSettlement from "../games/mutations/buildSettlement.js";
import type * as games_mutations_createGame from "../games/mutations/createGame.js";
import type * as games_mutations_deleteGame from "../games/mutations/deleteGame.js";
import type * as games_mutations_endTurn from "../games/mutations/endTurn.js";
import type * as games_mutations_index from "../games/mutations/index.js";
import type * as games_mutations_placeSetupSettlement from "../games/mutations/placeSetupSettlement.js";
import type * as games_mutations_rollDice from "../games/mutations/rollDice.js";
import type * as games_queries_getGame from "../games/queries/getGame.js";
import type * as games_queries_getGamePlayers from "../games/queries/getGamePlayers.js";
import type * as games_queries_getMyResources from "../games/queries/getMyResources.js";
import type * as games_queries_index from "../games/queries/index.js";
import type * as http from "../http.js";
import type * as lobbies_api from "../lobbies/api.js";
import type * as lobbies_mutations_addAIPlayer from "../lobbies/mutations/addAIPlayer.js";
import type * as lobbies_mutations_createLobby from "../lobbies/mutations/createLobby.js";
import type * as lobbies_mutations_deleteLobby from "../lobbies/mutations/deleteLobby.js";
import type * as lobbies_mutations_finalizeColorsAndStartGame from "../lobbies/mutations/finalizeColorsAndStartGame.js";
import type * as lobbies_mutations_index from "../lobbies/mutations/index.js";
import type * as lobbies_mutations_joinLobby from "../lobbies/mutations/joinLobby.js";
import type * as lobbies_mutations_leaveLobby from "../lobbies/mutations/leaveLobby.js";
import type * as lobbies_mutations_selectPlayerColor from "../lobbies/mutations/selectPlayerColor.js";
import type * as lobbies_mutations_setPlayerReady from "../lobbies/mutations/setPlayerReady.js";
import type * as lobbies_mutations_startGame from "../lobbies/mutations/startGame.js";
import type * as lobbies_mutations_updateLobby from "../lobbies/mutations/updateLobby.js";
import type * as lobbies_queries_getAvailableColors from "../lobbies/queries/getAvailableColors.js";
import type * as lobbies_queries_getLobbies from "../lobbies/queries/getLobbies.js";
import type * as lobbies_queries_getLobby from "../lobbies/queries/getLobby.js";
import type * as lobbies_queries_getLobbyPlayers from "../lobbies/queries/getLobbyPlayers.js";
import type * as lobbies_queries_getUserLobbies from "../lobbies/queries/getUserLobbies.js";
import type * as lobbies_queries_index from "../lobbies/queries/index.js";
import type * as robber_api from "../robber/api.js";
import type * as robber_mutations_index from "../robber/mutations/index.js";
import type * as robber_mutations_moveRobber from "../robber/mutations/moveRobber.js";
import type * as robber_queries_getRobberPosition from "../robber/queries/getRobberPosition.js";
import type * as robber_queries_index from "../robber/queries/index.js";
import type * as stats_api from "../stats/api.js";
import type * as stats_mutations_index from "../stats/mutations/index.js";
import type * as stats_mutations_recordGameStatistics from "../stats/mutations/recordGameStatistics.js";
import type * as stats_queries_getGameStatistics from "../stats/queries/getGameStatistics.js";
import type * as stats_queries_index from "../stats/queries/index.js";
import type * as trades_api from "../trades/api.js";
import type * as trades_mutations_acceptOffer from "../trades/mutations/acceptOffer.js";
import type * as trades_mutations_bankTrade from "../trades/mutations/bankTrade.js";
import type * as trades_mutations_createOffer from "../trades/mutations/createOffer.js";
import type * as trades_mutations_index from "../trades/mutations/index.js";
import type * as trades_queries_getActiveOffers from "../trades/queries/getActiveOffers.js";
import type * as trades_queries_getBankTrades from "../trades/queries/getBankTrades.js";
import type * as trades_queries_index from "../trades/queries/index.js";
import type * as users_api from "../users/api.js";
import type * as users_mutations_handleUserCreated from "../users/mutations/handleUserCreated.js";
import type * as users_mutations_handleUserDeleted from "../users/mutations/handleUserDeleted.js";
import type * as users_mutations_handleUserUpdated from "../users/mutations/handleUserUpdated.js";
import type * as users_mutations_index from "../users/mutations/index.js";
import type * as users_mutations_updateGameStats from "../users/mutations/updateGameStats.js";
import type * as users_mutations_updateUserProfile from "../users/mutations/updateUserProfile.js";
import type * as users_queries_getCurrentAuthenticatedUser from "../users/queries/getCurrentAuthenticatedUser.js";
import type * as users_queries_getUser from "../users/queries/getUser.js";
import type * as users_queries_getUserByClerkId from "../users/queries/getUserByClerkId.js";
import type * as users_queries_getUserById from "../users/queries/getUserById.js";
import type * as users_queries_getUserStats from "../users/queries/getUserStats.js";
import type * as users_queries_index from "../users/queries/index.js";
import type * as users_queries_searchUsers from "../users/queries/searchUsers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "gameLogs/mutations/addLogEntry": typeof gameLogs_mutations_addLogEntry;
  "gameLogs/mutations/index": typeof gameLogs_mutations_index;
  "gameLogs/queries/getGameLogs": typeof gameLogs_queries_getGameLogs;
  "gameLogs/queries/index": typeof gameLogs_queries_index;
  "games/api": typeof games_api;
  "games/lib/boardGeneration": typeof games_lib_boardGeneration;
  "games/mutations/advanceTurn": typeof games_mutations_advanceTurn;
  "games/mutations/buildRoad": typeof games_mutations_buildRoad;
  "games/mutations/buildSettlement": typeof games_mutations_buildSettlement;
  "games/mutations/createGame": typeof games_mutations_createGame;
  "games/mutations/deleteGame": typeof games_mutations_deleteGame;
  "games/mutations/endTurn": typeof games_mutations_endTurn;
  "games/mutations/index": typeof games_mutations_index;
  "games/mutations/placeSetupSettlement": typeof games_mutations_placeSetupSettlement;
  "games/mutations/rollDice": typeof games_mutations_rollDice;
  "games/queries/getGame": typeof games_queries_getGame;
  "games/queries/getGamePlayers": typeof games_queries_getGamePlayers;
  "games/queries/getMyResources": typeof games_queries_getMyResources;
  "games/queries/index": typeof games_queries_index;
  http: typeof http;
  "lobbies/api": typeof lobbies_api;
  "lobbies/mutations/addAIPlayer": typeof lobbies_mutations_addAIPlayer;
  "lobbies/mutations/createLobby": typeof lobbies_mutations_createLobby;
  "lobbies/mutations/deleteLobby": typeof lobbies_mutations_deleteLobby;
  "lobbies/mutations/finalizeColorsAndStartGame": typeof lobbies_mutations_finalizeColorsAndStartGame;
  "lobbies/mutations/index": typeof lobbies_mutations_index;
  "lobbies/mutations/joinLobby": typeof lobbies_mutations_joinLobby;
  "lobbies/mutations/leaveLobby": typeof lobbies_mutations_leaveLobby;
  "lobbies/mutations/selectPlayerColor": typeof lobbies_mutations_selectPlayerColor;
  "lobbies/mutations/setPlayerReady": typeof lobbies_mutations_setPlayerReady;
  "lobbies/mutations/startGame": typeof lobbies_mutations_startGame;
  "lobbies/mutations/updateLobby": typeof lobbies_mutations_updateLobby;
  "lobbies/queries/getAvailableColors": typeof lobbies_queries_getAvailableColors;
  "lobbies/queries/getLobbies": typeof lobbies_queries_getLobbies;
  "lobbies/queries/getLobby": typeof lobbies_queries_getLobby;
  "lobbies/queries/getLobbyPlayers": typeof lobbies_queries_getLobbyPlayers;
  "lobbies/queries/getUserLobbies": typeof lobbies_queries_getUserLobbies;
  "lobbies/queries/index": typeof lobbies_queries_index;
  "robber/api": typeof robber_api;
  "robber/mutations/index": typeof robber_mutations_index;
  "robber/mutations/moveRobber": typeof robber_mutations_moveRobber;
  "robber/queries/getRobberPosition": typeof robber_queries_getRobberPosition;
  "robber/queries/index": typeof robber_queries_index;
  "stats/api": typeof stats_api;
  "stats/mutations/index": typeof stats_mutations_index;
  "stats/mutations/recordGameStatistics": typeof stats_mutations_recordGameStatistics;
  "stats/queries/getGameStatistics": typeof stats_queries_getGameStatistics;
  "stats/queries/index": typeof stats_queries_index;
  "trades/api": typeof trades_api;
  "trades/mutations/acceptOffer": typeof trades_mutations_acceptOffer;
  "trades/mutations/bankTrade": typeof trades_mutations_bankTrade;
  "trades/mutations/createOffer": typeof trades_mutations_createOffer;
  "trades/mutations/index": typeof trades_mutations_index;
  "trades/queries/getActiveOffers": typeof trades_queries_getActiveOffers;
  "trades/queries/getBankTrades": typeof trades_queries_getBankTrades;
  "trades/queries/index": typeof trades_queries_index;
  "users/api": typeof users_api;
  "users/mutations/handleUserCreated": typeof users_mutations_handleUserCreated;
  "users/mutations/handleUserDeleted": typeof users_mutations_handleUserDeleted;
  "users/mutations/handleUserUpdated": typeof users_mutations_handleUserUpdated;
  "users/mutations/index": typeof users_mutations_index;
  "users/mutations/updateGameStats": typeof users_mutations_updateGameStats;
  "users/mutations/updateUserProfile": typeof users_mutations_updateUserProfile;
  "users/queries/getCurrentAuthenticatedUser": typeof users_queries_getCurrentAuthenticatedUser;
  "users/queries/getUser": typeof users_queries_getUser;
  "users/queries/getUserByClerkId": typeof users_queries_getUserByClerkId;
  "users/queries/getUserById": typeof users_queries_getUserById;
  "users/queries/getUserStats": typeof users_queries_getUserStats;
  "users/queries/index": typeof users_queries_index;
  "users/queries/searchUsers": typeof users_queries_searchUsers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
