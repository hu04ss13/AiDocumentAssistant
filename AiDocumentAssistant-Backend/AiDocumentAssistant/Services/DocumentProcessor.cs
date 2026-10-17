using AiDocumentAssistant.Interfaces;
using Aspose.Words;

namespace AiDocumentAssistant.Services
{
    public class DocumentProcessor : IDocumentProcessor
    {
        public async Task<string> ExtractTextAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty.");
            }

            var allowedExtensions = new[]
            {
        ".docx",
        ".doc",
        ".pdf"
    };

            var extension =
                Path.GetExtension(file.FileName)
                     .ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException(
                    "Only DOC, DOCX and PDF files are supported.");
            }

            using var stream = file.OpenReadStream();

            var document = new Document(stream);

            var extractedText =
                document.ToString(SaveFormat.Text);

            return await Task.FromResult(extractedText);
        }
    }
}
