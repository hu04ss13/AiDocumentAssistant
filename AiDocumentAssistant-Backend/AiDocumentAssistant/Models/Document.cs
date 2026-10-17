namespace AiDocumentAssistant.Models
{
    public class Document
    {
        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public string? FilePath { get; set; }

        public string? ExtractedText { get; set; }

        public string Status { get; set; } = "Uploaded";

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public string? AiSummary { get; set; }

        public string? ExtractedKeywords { get; set; }
    }
}
