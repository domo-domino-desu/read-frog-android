import { afterEach, describe, expect, it, vi } from "vitest"

describe("google drive auth", () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.doUnmock("#imports")
  })

  it("does not read identity redirect URLs during module evaluation", async () => {
    const getRedirectURL = vi.fn<() => string>(() => "https://example.com")

    vi.doMock("#imports", () => ({
      browser: {
        identity: {
          getRedirectURL,
          launchWebAuthFlow: vi.fn<(...args: any[]) => any>(),
        },
      },
      storage: {
        getItem: vi.fn<(...args: any[]) => any>(),
        removeItem: vi.fn<(...args: any[]) => any>(),
        setItem: vi.fn<(...args: any[]) => any>(),
      },
    }))

    await import("../auth")

    expect(getRedirectURL).not.toHaveBeenCalled()
  })

  it("returns a recognizable unsupported-platform error on Firefox Android", async () => {
    vi.stubEnv("BROWSER", "firefox")
    vi.stubEnv("WXT_FIREFOX_ANDROID", "true")

    const auth = await import("../auth")

    const results = await Promise.allSettled(
      [
        () => auth.authenticateGoogleDriveAndSaveTokenToStorage(),
        () => auth.getValidAccessToken(),
        () => auth.getIsAuthenticated(),
      ].map((action) => action()),
    )

    expect(
      results.every(
        (result) =>
          result.status === "rejected" && auth.isGoogleDrivePlatformUnsupportedError(result.reason),
      ),
    ).toBe(true)
    expect(results).toEqual(
      Array.from({ length: 3 }, () => ({
        status: "rejected",
        reason: expect.objectContaining({
          code: auth.GOOGLE_DRIVE_PLATFORM_UNSUPPORTED_ERROR_CODE,
        }),
      })),
    )
  })
})
