# Briefly — AI document assistant

A responsive React and TypeScript frontend for the existing ASP.NET document API. Users can upload a PDF, DOC, or DOCX file from their computer. The backend extracts the text, generates a summary and keywords, and saves the processed document.

## Run locally

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env` if you want to configure a non-default API URL.
3. Start the .NET API on `http://localhost:5113` (the URL in the backend's `http` launch profile).
4. In this directory, run `npm install` and `npm run dev`.
5. Open the local URL printed by Vite.

In development, `/api` is proxied to `http://localhost:5113`. Vite does not reliably support `#` in a project path; on Windows, move or rename the project and reopen it from a path without `#` before running `npm run dev` (for example, `C:\Projects\AiDocumentAssistant\AiDocumentAssistant-Frontend`). Set `VITE_API_BASE_URL` to override the API origin. For production, deploy behind a same-origin reverse proxy or configure the API to allow the frontend origin with CORS.

## API contract

- `GET /api/documents` lists saved documents.
- `POST /api/documents/upload` accepts multipart form data with a `file` field and returns the document, summary, and comma-separated keywords.
