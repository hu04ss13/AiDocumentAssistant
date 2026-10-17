using AiDocumentAssistant.DTOs;

namespace AiDocumentAssistant.Interfaces
{
    public interface IAIService
    {
        Task<DocumentAnalysisResult> AnalyzeDocumentAsync(string documentText, CancellationToken cancellationToken = default);
    }
}
