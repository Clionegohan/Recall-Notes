/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions_index from "../functions/index.js";
import type * as functions_playlists from "../functions/playlists.js";
import type * as functions_spotify from "../functions/spotify.js";
import type * as functions_users from "../functions/users.js";
import type * as lib_spotify from "../lib/spotify.js";
import type * as types_spotify from "../types/spotify.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/index": typeof functions_index;
  "functions/playlists": typeof functions_playlists;
  "functions/spotify": typeof functions_spotify;
  "functions/users": typeof functions_users;
  "lib/spotify": typeof lib_spotify;
  "types/spotify": typeof types_spotify;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
