export interface DocumentRecord {
  id: number
  fileName: string
  contentType: string
  extractedText?: string | null
  status: string
  uploadedAt: string
  aiSummary?: string | null
  extractedKeywords?: string | null
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

async function readError(response: Response): Promise<string> {
  const body = await response.text()
  if (!body) return `Request failed (${response.status}).`

  try {
    const parsed: unknown = JSON.parse(body)
    if (typeof parsed === 'string') return parsed
    if (
      parsed &&
      typeof parsed === 'object' &&
      'message' in parsed &&
      typeof parsed.message === 'string'
    ) {
      return parsed.message
    }
  } catch {
    // ASP.NET may return plain text for validation errors.
  }

  return body
}

export async function uploadDocument(file: File): Promise<DocumentRecord> {
  const formData = new FormData()
  formData.append('file', file, file.name)

  const response = await fetch(`${apiBaseUrl}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as DocumentRecord
}

export async function getDocuments(): Promise<DocumentRecord[]> {
  const response = await fetch(`${apiBaseUrl}/api/documents`)
  if (!response.ok) {
    throw new Error(await readError(response))
  }

  const documents: unknown = await response.json()
  if (!Array.isArray(documents)) {
    throw new Error('The document service returned an unexpected response.')
  }

  return documents as DocumentRecord[]
}
