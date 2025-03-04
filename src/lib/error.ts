/**
 * Özel hata sınıfları
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends Error {
  constructor(entity: string, id?: number | string) {
    super(id ? `${entity} bulunamadı (ID: ${id})` : `${entity} bulunamadı`)
    this.name = "NotFoundError"
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message)
    this.name = "DatabaseError"
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthorizationError"
  }
}

/**
 * Hata yönetimi için yardımcı fonksiyonlar
 */
export function handleError(error: unknown): { error: string } {
  console.error("Hata oluştu:", error)

  if (error instanceof ValidationError) {
    return { error: error.message }
  }

  if (error instanceof NotFoundError) {
    return { error: error.message }
  }

  if (error instanceof DatabaseError) {
    return { error: "Veritabanı işlemi sırasında bir hata oluştu." }
  }

  if (error instanceof AuthorizationError) {
    return { error: "Bu işlemi yapmaya yetkiniz yok." }
  }

  if (error instanceof Error) {
    return { error: error.message }
  }

  return { error: "Beklenmeyen bir hata oluştu." }
}

/**
 * Async fonksiyonlar için try-catch bloğunu saran bir yardımcı fonksiyon
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage = "İşlem sırasında bir hata oluştu."
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn()
    return { data }
  } catch (error) {
    console.error(errorMessage, error)
    return handleError(error)
  }
} 