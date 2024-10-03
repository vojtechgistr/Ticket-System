using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public class UpdateUserRequestDto
{
    [MinLength(4)]
    [MaxLength(32)]
    public string? DisplayName { get; init; }
    
    [EmailAddress]
    public string? Email { get; init; }
    
    [StringLength(4)]
    public string? Tag { get; init; }

    [MaxLength(500)]
    public string? AvatarUrl { get; init; }

    [MaxLength(64)]
    public string? BannerColor { get; init; }
}