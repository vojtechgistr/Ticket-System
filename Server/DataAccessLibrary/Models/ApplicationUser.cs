using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace DataAccessLibrary.Models;

public class ApplicationUser : IdentityUser
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public override string Id
    {
        get => base.Id;
        set => base.Id = value;
    }

    [MinLength(4)]
    [MaxLength(32)]
    public string DisplayName { get; set; }

    [Required]
    [MinLength(4), MaxLength(4)]
    public string Tag { get; set; }

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }
    
    [MaxLength(64)]
    public string? BannerColor { get; set; }
}