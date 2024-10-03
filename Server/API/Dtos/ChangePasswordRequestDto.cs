using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public class ChangePasswordRequestDto
{
    [Required]
    [MinLength(8)]
    [MaxLength(255)]
    public string? OldPassword { get; init; }

    [Required]
    [MinLength(8)]
    [MaxLength(255)]
    public string? Password { get; init; }

    [Compare("Password")]
    public string? ConfirmPassword { get; init; }
}