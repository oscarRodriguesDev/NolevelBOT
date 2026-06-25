import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRemove = vi.fn()

beforeEach(() => {
  vi.resetModules()
  mockRemove.mockReset()
})

describe("deleteStorageFile", () => {
  it("retorna true quando url e null", async () => {
    vi.doMock("@/lib/upload", async () => {
      const actual = await vi.importActual<typeof import("@/lib/upload")>("@/lib/upload")
      return { ...actual, deleteStorageFile: actual.deleteStorageFile }
    })
    const { deleteStorageFile } = await import("@/lib/upload")
    const result = await deleteStorageFile(null)
    expect(result).toBe(true)
  })

  it("retorna true quando url e undefined", async () => {
    vi.doMock("@/lib/upload", async () => {
      const actual = await vi.importActual<typeof import("@/lib/upload")>("@/lib/upload")
      return { ...actual, deleteStorageFile: actual.deleteStorageFile }
    })
    const { deleteStorageFile } = await import("@/lib/upload")
    const result = await deleteStorageFile(undefined)
    expect(result).toBe(true)
  })

  it("retorna true quando url e string vazia", async () => {
    vi.doMock("@/lib/upload", async () => {
      const actual = await vi.importActual<typeof import("@/lib/upload")>("@/lib/upload")
      return { ...actual, deleteStorageFile: actual.deleteStorageFile }
    })
    const { deleteStorageFile } = await import("@/lib/upload")
    const result = await deleteStorageFile("")
    expect(result).toBe(true)
  })

  it("extrai bucket e path e chama supabase.storage.from().remove()", async () => {
    mockRemove.mockResolvedValue({ error: null })

    vi.doMock("@/lib/upload", async () => {
      const actual = await vi.importActual<typeof import("@/lib/upload")>("@/lib/upload")
      return { ...actual, deleteStorageFile: actual.deleteStorageFile }
    })

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => ({
        storage: {
          from: vi.fn(() => ({
            remove: mockRemove,
          })),
        },
      })),
    }))

    const { deleteStorageFile } = await import("@/lib/upload")
    const url = "https://xyz.supabase.co/storage/v1/object/public/anexo/12345678901/abc-123.jpg"
    const result = await deleteStorageFile(url)

    expect(result).toBe(true)
    expect(mockRemove).toHaveBeenCalledWith(["12345678901/abc-123.jpg"])
  })

  it("retorna false quando supabase retorna erro", async () => {
    mockRemove.mockResolvedValue({ error: new Error("Storage error") })

    vi.doMock("@/lib/upload", async () => {
      const actual = await vi.importActual<typeof import("@/lib/upload")>("@/lib/upload")
      return { ...actual, deleteStorageFile: actual.deleteStorageFile }
    })

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => ({
        storage: {
          from: vi.fn(() => ({
            remove: mockRemove,
          })),
        },
      })),
    }))

    const { deleteStorageFile } = await import("@/lib/upload")
    const url = "https://xyz.supabase.co/storage/v1/object/public/profile/user-avatar.jpg"
    const result = await deleteStorageFile(url)

    expect(result).toBe(false)
    expect(mockRemove).toHaveBeenCalledWith(["user-avatar.jpg"])
  })

  it("retorna false para url que nao corresponde ao padrao do Supabase", async () => {
    vi.doMock("@/lib/upload", async () => {
      const actual = await vi.importActual<typeof import("@/lib/upload")>("@/lib/upload")
      return { ...actual, deleteStorageFile: actual.deleteStorageFile }
    })

    const { deleteStorageFile } = await import("@/lib/upload")
    const result = await deleteStorageFile("https://example.com/file.jpg")
    expect(result).toBe(false)
  })

  it("extrai bucket profile e caminho sem pasta", async () => {
    mockRemove.mockResolvedValue({ error: null })

    vi.doMock("@/lib/upload", async () => {
      const actual = await vi.importActual<typeof import("@/lib/upload")>("@/lib/upload")
      return { ...actual, deleteStorageFile: actual.deleteStorageFile }
    })

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => ({
        storage: {
          from: vi.fn(() => ({
            remove: mockRemove,
          })),
        },
      })),
    }))

    const { deleteStorageFile } = await import("@/lib/upload")
    const url = "https://xyz.supabase.co/storage/v1/object/public/profile/cfa70ab9-e566-4bc4-ae53-97c83f24e7e9.jpeg"
    const result = await deleteStorageFile(url)

    expect(result).toBe(true)
    expect(mockRemove).toHaveBeenCalledWith(["cfa70ab9-e566-4bc4-ae53-97c83f24e7e9.jpeg"])
  })

  it("extrai bucket logo com pasta empresas", async () => {
    mockRemove.mockResolvedValue({ error: null })

    vi.doMock("@/lib/upload", async () => {
      const actual = await vi.importActual<typeof import("@/lib/upload")>("@/lib/upload")
      return { ...actual, deleteStorageFile: actual.deleteStorageFile }
    })

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => ({
        storage: {
          from: vi.fn(() => ({
            remove: mockRemove,
          })),
        },
      })),
    }))

    const { deleteStorageFile } = await import("@/lib/upload")
    const url = "https://xyz.supabase.co/storage/v1/object/public/logo/empresas/logo-empresa.png"
    const result = await deleteStorageFile(url)

    expect(result).toBe(true)
    expect(mockRemove).toHaveBeenCalledWith(["empresas/logo-empresa.png"])
  })
})