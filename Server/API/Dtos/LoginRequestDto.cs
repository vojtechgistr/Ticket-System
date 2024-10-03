using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; init; }
    
    [Required]
    // NOTE: A better idea would be to globalize condition values.
    [MinLength(8)]
    [MaxLength(255)]
    public string Password { get; init; }
}