using AiDocumentAssistant.DTOs;

namespace AiDocumentAssistant.Interfaces
{
    public interface IDocumentService
    {
        Task<List<DocumentResponseDto>> GetAllAsync();

        Task<DocumentResponseDto?> GetByIdAsync(int id);

        Task<DocumentResponseDto> CreateAsync(DocumentResponseDto dto);

        Task<bool> UpdateAsync(int id, DocumentResponseDto dto);

        Task<bool> DeleteAsync(int id);

        Task<DocumentResponseDto> UploadAndProcessAsync(IFormFile file);
    }
}
