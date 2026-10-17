using AiDocumentAssistant.DTOs;
using AiDocumentAssistant.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AiDocumentAssistant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentsController(
            IDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var documents = await _documentService.GetAllAsync();

            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var document = await _documentService.GetByIdAsync(id);

            if (document == null)
            {
                return NotFound("Document not found.");
            }

            return Ok(document);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            DocumentResponseDto dto)
        {
            var document =
                await _documentService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = document.Id },
                document);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            DocumentResponseDto dto)
        {
            var updated =
                await _documentService.UpdateAsync(id, dto);

            if (!updated)
            {
                return NotFound("Document not found.");
            }

            return Ok("Document updated successfully.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _documentService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound("Document not found.");
            }

            return Ok("Document deleted successfully.");
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            try
            {
                var result =
                    await _documentService.UploadAndProcessAsync(file);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
