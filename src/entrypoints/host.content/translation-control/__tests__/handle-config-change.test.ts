import type { PageTranslationManager } from "../page-translation"
import type { Config } from "@/types/config/config"
import { describe, expect, it, vi } from "vitest"
import { handleTranslationModeChange } from "../handle-config-change"

function createMockConfig(mode: "bilingual" | "translationOnly"): Config {
  return { translate: { mode } } as Config
}

function createMockManager(isActive: boolean) {
  const setEnabled = vi.fn<(...args: any[]) => any>().mockResolvedValue(undefined)
  const manager = {
    isActive,
    setEnabled,
  } as unknown as PageTranslationManager
  return { manager, setEnabled }
}

describe("handleTranslationModeChange", () => {
  it("should trigger re-translation when mode changes and manager is active", () => {
    const { manager, setEnabled } = createMockManager(true)

    handleTranslationModeChange(
      createMockConfig("translationOnly"),
      createMockConfig("bilingual"),
      manager,
    )

    expect(setEnabled).toHaveBeenNthCalledWith(1, false)
    expect(setEnabled).toHaveBeenNthCalledWith(2, true)
  })

  it("should not trigger when mode stays the same", () => {
    const { manager, setEnabled } = createMockManager(true)

    handleTranslationModeChange(
      createMockConfig("bilingual"),
      createMockConfig("bilingual"),
      manager,
    )

    expect(setEnabled).not.toHaveBeenCalled()
  })

  it("should not trigger when manager is not active", () => {
    const { manager, setEnabled } = createMockManager(false)

    handleTranslationModeChange(
      createMockConfig("translationOnly"),
      createMockConfig("bilingual"),
      manager,
    )

    expect(setEnabled).not.toHaveBeenCalled()
  })
})
