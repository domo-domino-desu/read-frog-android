import { supportsContextMenu } from "@/utils/platform"

export const ROUTE_DEFS = [
  { path: "/" },
  { path: "/api-providers" },
  { path: "/custom-actions" },
  { path: "/translation" },
  { path: "/site-rules" },
  { path: "/video-subtitles" },
  { path: "/floating-button" },
  { path: "/selection-toolbar" },
  ...(supportsContextMenu ? [{ path: "/context-menu" } as const] : []),
  { path: "/input-translation" },
  ...(import.meta.env.BROWSER === "firefox" ? [] : [{ path: "/tts" } as const]),
  { path: "/statistics" },
  { path: "/config" },
] as const
