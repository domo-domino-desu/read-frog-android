import type { PageTranslationManager } from "../page-translation"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { bindTranslationShortcutKey } from "../bind-translation-shortcut"

const { mockGetLocalConfig, mockRegister, mockUnregister } = vi.hoisted(() => ({
  mockGetLocalConfig: vi.fn<(...args: any[]) => any>(),
  mockRegister: vi.fn<(...args: any[]) => any>(),
  mockUnregister: vi.fn<(...args: any[]) => any>(),
}))

vi.mock("@tanstack/hotkeys", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/hotkeys")>()

  return {
    ...actual,
    HotkeyManager: {
      getInstance: () => ({
        register: mockRegister,
      }),
    },
  }
})

vi.mock("@/utils/config/storage", () => ({
  getLocalConfig: mockGetLocalConfig,
}))

function createManager(isActive = false) {
  const setEnabled = vi.fn<(...args: any[]) => any>().mockResolvedValue(undefined)
  const start = vi.fn<(...args: any[]) => any>().mockResolvedValue(undefined)
  const stop = vi.fn<(...args: any[]) => any>()
  const manager = {
    isActive,
    setEnabled,
    start,
    stop,
  } as unknown as PageTranslationManager

  return { manager, setEnabled, start, stop }
}

describe("bindTranslationShortcutKey", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRegister.mockReturnValue({
      unregister: mockUnregister,
    })
  })

  it("registers the page shortcut with the TanStack manager options", async () => {
    mockGetLocalConfig.mockResolvedValue({
      translate: {
        page: {
          shortcut: "Mod+E",
        },
      },
    })

    const { manager } = createManager(false)
    const cleanup = await bindTranslationShortcutKey(manager)

    expect(mockRegister).toHaveBeenCalledWith(
      "Mod+E",
      expect.any(Function),
      expect.objectContaining({
        ignoreInputs: true,
        preventDefault: true,
        stopPropagation: true,
      }),
    )

    cleanup()
    expect(mockUnregister).toHaveBeenCalled()
  })

  it("toggles page translation through the registered callback", async () => {
    mockGetLocalConfig.mockResolvedValue({
      translate: {
        page: {
          shortcut: "Mod+E",
        },
      },
    })

    const { manager: inactiveManager, setEnabled: inactiveSetEnabled } = createManager(false)
    await bindTranslationShortcutKey(inactiveManager)
    const startCallback = mockRegister.mock.calls[0]?.[1]
    startCallback?.({}, { hotkey: "Mod+E" })
    expect(inactiveSetEnabled).toHaveBeenCalledWith(true, expect.any(Object))

    vi.clearAllMocks()
    mockRegister.mockReturnValue({
      unregister: mockUnregister,
    })
    mockGetLocalConfig.mockResolvedValue({
      translate: {
        page: {
          shortcut: "Mod+E",
        },
      },
    })

    const { manager: activeManager, setEnabled: activeSetEnabled } = createManager(true)
    await bindTranslationShortcutKey(activeManager)
    const stopCallback = mockRegister.mock.calls[0]?.[1]
    stopCallback?.({}, { hotkey: "Mod+E" })
    expect(activeSetEnabled).toHaveBeenCalledWith(false, expect.any(Object))
  })

  it("skips registration when the shortcut is empty", async () => {
    mockGetLocalConfig.mockResolvedValue({
      translate: {
        page: {
          shortcut: "",
        },
      },
    })

    const { manager } = createManager(false)
    const cleanup = await bindTranslationShortcutKey(manager)

    expect(mockRegister).not.toHaveBeenCalled()
    cleanup()
    expect(mockUnregister).not.toHaveBeenCalled()
  })
})
