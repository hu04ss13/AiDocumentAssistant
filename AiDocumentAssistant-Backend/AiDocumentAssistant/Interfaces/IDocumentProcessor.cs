namespace AiDocumentAssistant.Interfaces
{
    public interface IDocumentProcessor
    {
        Task<string> ExtractTextAsync(IFormFile file);
    }
}
