import { describe, expect, it, vi } from "vitest"
import { setupOptionalContextMenu } from "@/entrypoints/background"

describe("setupOptionalContextMenu", () => {
  it("skips context menu setup when the target does not support it", () => {
    const registerContextMenuListeners = vi.fn<() => void>()
    setupOptionalContextMenu({
      registerContextMenuListeners,
      supportsContextMenu: false,
    })

    expect(registerContextMenuListeners).not.toHaveBeenCalled()
  })

  it("registers context menu listeners when supported", () => {
    const registerContextMenuListeners = vi.fn<() => void>()

    setupOptionalContextMenu({
      registerContextMenuListeners,
      supportsContextMenu: true,
    })

    expect(registerContextMenuListeners).toHaveBeenCalledOnce()
  })
})
