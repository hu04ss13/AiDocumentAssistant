using AiDocumentAssistant.Models;
using Microsoft.EntityFrameworkCore;

namespace AiDocumentAssistant.Data
{
    public class ApplicationDbContext:DbContext
    {
        public ApplicationDbContext(
       DbContextOptions<ApplicationDbContext> options)
       : base(options)
        {
        }

        public DbSet<Document> Documents { get; set; }
    }
}
