using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public class TicketDto
{
    [Required]
    [MinLength(4), MaxLength(40)]
    public string Title { get; set; }
    [Required]
    [MinLength(12), MaxLength(200)]
    public string Content { get; set; }
    public string? AuthorName { get; set; }
    public string? AuthorEmail { get; set; }
    public DateTime PostDate { get; set; } = DateTime.Now;
}