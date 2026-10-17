using AiDocumentAssistant.Data;
using AiDocumentAssistant.DTOs;
using AiDocumentAssistant.Interfaces;
using Microsoft.EntityFrameworkCore;
using AiDocumentAssistant.Models;

namespace AiDocumentAssistant.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentProcessor _documentProcessor;
        private readonly IAIService _aiService;

        public DocumentService(
            ApplicationDbContext context,
            IDocumentProcessor documentProcessor, IAIService aiService)
        {
            _context = context;
            _documentProcessor = documentProcessor;
            _aiService = aiService;
        }
        public async Task<List<DocumentResponseDto>> GetAllAsync()
        {
            return await _context.Documents
                .Select(d => new DocumentResponseDto
                {
                    Id = d.Id,
                    FileName = d.FileName,
                    ContentType = d.ContentType,
                    ExtractedText = d.ExtractedText,
                    Status = d.Status,
                    UploadedAt = d.UploadedAt
                })
                .ToListAsync();
        }

        public async Task<DocumentResponseDto?> GetByIdAsync(int id)
        {
            return await _context.Documents
                .Where(d => d.Id == id)
                .Select(d => new DocumentResponseDto
                {
                    Id = d.Id,
                    FileName = d.FileName,
                    ContentType = d.ContentType,
                    ExtractedText = d.ExtractedText,
                    Status = d.Status,
                    UploadedAt = d.UploadedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<DocumentResponseDto> CreateAsync(
            DocumentResponseDto dto)
        {
            var document = new Document
            {
                FileName = dto.FileName,
                ContentType = dto.ContentType,
                ExtractedText = dto.ExtractedText,
                Status = dto.Status,
                UploadedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);

            await _context.SaveChangesAsync();

            dto.Id = document.Id;
            dto.UploadedAt = document.UploadedAt;

            return dto;
        }

        public async Task<bool> UpdateAsync(
            int id,
            DocumentResponseDto dto)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                return false;
            }

            document.FileName = dto.FileName;
            document.ContentType = dto.ContentType;
            document.ExtractedText = dto.ExtractedText;
            document.Status = dto.Status;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                return false;
            }

            _context.Documents.Remove(document);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<DocumentResponseDto> UploadAndProcessAsync(
     IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException(
                    "Please upload a valid document.");
            }

            // Step 1: Extract document text using Aspose.Words.
            var extractedText =
                await _documentProcessor.ExtractTextAsync(file);

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                throw new ArgumentException(
                    "No readable text was found in the document.");
            }

            // Step 2: Analyze the extracted text using Phi through Ollama.
            var analysis =
                await _aiService.AnalyzeDocumentAsync(extractedText);

            // Step 3: Create the database entity.
            var document = new Document
            {
                FileName = Path.GetFileName(file.FileName),
                ContentType = file.ContentType,
                ExtractedText = extractedText,
                AiSummary = analysis.Summary,
                ExtractedKeywords = string.Join(
                    ", ",
                    analysis.Keywords),
                Status = "Processed",
                UploadedAt = DateTime.UtcNow
            };

            // Step 4: Save the document and AI results.
            _context.Documents.Add(document);

            await _context.SaveChangesAsync();

            // Step 5: Return the processed result.
            return new DocumentResponseDto
            {
                Id = document.Id,
                FileName = document.FileName,
                ContentType = document.ContentType,
                ExtractedText = document.ExtractedText,
                AiSummary = document.AiSummary,
                ExtractedKeywords = document.ExtractedKeywords,
                Status = document.Status,
                UploadedAt = document.UploadedAt
            };
        }
    }
}
