import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  FileText,
  FileUp,
  FolderOpen,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Sparkles,
  Tag,
  Upload,
  X,
} from 'lucide-react'
import { getDocuments, type DocumentRecord, uploadDocument } from './api.ts'

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx'

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toUpperCase()
  return extension && ['PDF', 'DOC', 'DOCX'].includes(extension)
    ? extension
    : 'DOC'
}

function getKeywords(value?: string | null): string[] {
  return value
    ?.split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean) ?? []
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<DocumentRecord | null>(null)
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    let active = true
    getDocuments()
      .then((items) => {
        if (active) setDocuments(items.slice().reverse())
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? `Could not load your documents. ${cause.message}`
              : 'Could not load your documents.',
          )
        }
      })
      .finally(() => {
        if (active) setLoadingDocuments(false)
      })
    return () => {
      active = false
    }
  }, [])

  function selectFile(file?: File) {
    if (!file) return
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !['pdf', 'doc', 'docx'].includes(extension)) {
      setError('Choose a PDF, DOC, or DOCX file to get started.')
      setSelectedFile(null)
      setResult(null)
      return
    }
    setError('')
    setResult(null)
    setSelectedFile(file)
  }

  async function handleUpload() {
    if (!selectedFile || uploading) return
    setUploading(true)
    setError('')
    try {
      const processed = await uploadDocument(selectedFile)
      setResult(processed)
      setSelectedFile(null)
      setDocuments((current) => [
        processed,
        ...current.filter((item) => item.id !== processed.id),
      ])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Something went wrong while analyzing the document.',
      )
    } finally {
      setUploading(false)
    }
  }

  async function copySummary() {
    if (!result?.aiSummary) return
    try {
      await navigator.clipboard.writeText(result.aiSummary)
    } catch {
      setError('Could not copy the summary. Check your browser clipboard permissions.')
    }
  }

  function handleDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files[0])
  }

  const resultKeywords = getKeywords(result?.extractedKeywords)

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className={`sidebar${mobileNavOpen ? ' sidebar-open' : ''}`}>
        <a className="brand" href="#main-content" aria-label="Briefly home">
          <span className="brand-mark"><Sparkles size={20} strokeWidth={2.2} /></span>
          <span>briefly<span className="brand-period">.</span></span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-link nav-link-active" href="#main-content" aria-current="page" onClick={() => setMobileNavOpen(false)}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </a>
          <a className="nav-link" href="#recent-documents" onClick={() => setMobileNavOpen(false)}>
            <FolderOpen size={18} />
            <span>My documents</span>
            <span className="nav-count">{documents.length}</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon"><Sparkles size={15} /></span>
            <p><strong>Less reading, more doing.</strong> Let AI find the important bits for you.</p>
          </div>
          <div className="profile">
            <div className="avatar" aria-hidden="true">B</div>
            <div className="profile-copy">
              <strong>Briefly workspace</strong>
              <span>AI document assistant</span>
            </div>
          </div>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          className="mobile-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="main-column">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            type="button"
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>Overview</strong></div>
          <div className="topbar-right">
            <span className="secure-note"><span className="secure-dot" /> AI-powered workspace</span>
          </div>
        </header>

        <main id="main-content" className="content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR AI DOCUMENT WORKSPACE</div>
              <h1>Make sense of<br className="mobile-break" /> the paperwork<span className="heading-period">.</span></h1>
              <p className="welcome-copy">Drop in a document. Get the important bits, without the hours of reading.</p>
            </div>
            <div className="date-chip"><Clock3 size={15} /> Your workspace, at a glance</div>
          </section>

          {error && (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
              <button className="icon-button alert-dismiss" type="button" aria-label="Dismiss message" onClick={() => setError('')}>
                <X size={17} />
              </button>
            </div>
          )}

          <section className="upload-card" aria-labelledby="upload-title">
            <div className="section-heading upload-heading">
              <div className="upload-heading-icon"><FileUp size={19} /></div>
              <div>
                <h2 id="upload-title">Start with a document</h2>
                <p>We'll read it, summarize it, and pull out the key ideas.</p>
              </div>
            </div>

            <div
              className={`drop-zone${isDragging ? ' drop-zone-active' : ''}${selectedFile ? ' drop-zone-selected' : ''}`}
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsDragging(false)
                }
              }}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                className="visually-hidden"
                id="document-file"
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={(event) => selectFile(event.currentTarget.files?.[0])}
                aria-label="Choose a PDF, DOC, or DOCX document"
              />
              {selectedFile ? (
                <div className="selected-file">
                  <div className="file-icon"><FileText size={23} /></div>
                  <div className="selected-file-info">
                    <strong title={selectedFile.name}>{selectedFile.name}</strong>
                    <span>{formatFileSize(selectedFile.size)} <span className="file-separator">·</span> Ready to analyze</span>
                  </div>
                  <button
                    className="icon-button remove-file"
                    type="button"
                    aria-label={`Remove ${selectedFile.name}`}
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    disabled={uploading}
                  >
                    <X size={18} />
                  </button>
                  <button className="primary-button analyze-button" type="button" onClick={handleUpload} disabled={uploading}>
                    {uploading ? <><LoaderCircle size={17} className="spin" /> Analyzing...</> : <><Sparkles size={16} /> Analyze document</>}
                    {!uploading && <ArrowRight size={16} />}
                  </button>
                </div>
              ) : (
                <div className="drop-content">
                  <div className="upload-icon"><Upload size={21} /></div>
                  <div className="drop-copy">
                    <p><strong>Drag your file here</strong><span> or browse your computer</span></p>
                    <span className="file-support">PDF, DOC, or DOCX</span>
                  </div>
                  <button className="secondary-button browse-button" type="button" onClick={() => fileInputRef.current?.click()}>
                    Browse files
                  </button>
                </div>
              )}
            </div>

          </section>

          {result && (
            <section className="result-card" aria-labelledby="result-title" aria-live="polite">
              <div className="result-topline">
                <div className="result-badge"><Check size={13} /> ANALYSIS COMPLETE</div>
                <span className="result-date">{formatDate(result.uploadedAt)}</span>
              </div>
              <div className="result-title-row">
                <div className="file-icon result-file-icon"><FileText size={21} /></div>
                <div className="result-file-name">
                  <h2 id="result-title">{result.fileName}</h2>
                  <span>{getFileType(result.fileName)} <span className="file-separator">·</span> AI summary</span>
                </div>
                <button
                  className="icon-button copy-button"
                  type="button"
                  onClick={() => void copySummary()}
                  disabled={!result.aiSummary}
                  aria-label="Copy summary"
                  title="Copy summary"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="summary-content">
                <div className="result-label"><Sparkles size={14} /> THE SHORT VERSION</div>
                <p>{result.aiSummary || 'The document was processed, but no summary was returned.'}</p>
              </div>
              {resultKeywords.length > 0 && (
                <div className="keywords-content">
                  <div className="result-label"><Tag size={14} /> KEYWORDS</div>
                  <ul className="keyword-list" aria-label="Extracted keywords">
                    {resultKeywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section className="recent-section" id="recent-documents" aria-labelledby="recent-title">
            <div className="recent-heading">
              <div>
                <div className="section-kicker">YOUR LIBRARY</div>
                <h2 id="recent-title">Recent documents</h2>
              </div>
              {documents.length > 0 && <span className="document-count">{documents.length} {documents.length === 1 ? 'document' : 'documents'}</span>}
            </div>

            {loadingDocuments ? (
              <div className="library-empty library-loading"><LoaderCircle size={18} className="spin" /> Loading your documents...</div>
            ) : documents.length > 0 ? (
              <div className="document-list">
                {documents.slice(0, 5).map((document) => (
                  <article className="document-row" key={document.id}>
                    <div className={`document-type document-type-${getFileType(document.fileName).toLowerCase()}`} aria-hidden="true">
                      <FileText size={19} />
                    </div>
                    <div className="document-info">
                      <strong title={document.fileName}>{document.fileName}</strong>
                      <span>{getFileType(document.fileName)} <span className="file-separator">·</span> Added {formatDate(document.uploadedAt)}</span>
                    </div>
                    <span className={`status-pill${document.status.toLowerCase() === 'processed' ? ' status-ready' : ''}`}>
                      <span /> {document.status || 'Processed'}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="library-empty">
                <div className="empty-icon"><FolderOpen size={20} /></div>
                <div>
                  <strong>No documents yet</strong>
                  <span>Your analyzed documents will show up here.</span>
                </div>
              </div>
            )}
          </section>

          <footer className="page-footer">
            <span>Thoughtful summaries for a clearer day.</span>
            <span>Powered by your document API</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App
