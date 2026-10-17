namespace AiDocumentAssistant.DTOs
{
    public class DocumentResponseDto
    {
        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public string? ExtractedText { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; }

        public string? AiSummary { get; set; }

        public string? ExtractedKeywords { get; set; }
    }
}
