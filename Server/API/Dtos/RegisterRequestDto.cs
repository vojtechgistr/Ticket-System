using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace API.Dtos;

public class RegisterRequestDto
{
    [Required]
    // NOTE: A better idea would be to globalize condition values.
    [MinLength(4)]
    [MaxLength(32)]
    public string DisplayName { get; init; }

    [Required]
    [EmailAddress]
    public string Email { get; init; }

    [Required]
    [MinLength(8)]
    [MaxLength(255)]
    public string Password { get; init; }

    [Compare("Password")] public string ConfirmPassword { get; init; }
}