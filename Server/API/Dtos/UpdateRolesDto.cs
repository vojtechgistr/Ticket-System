using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public class UpdateRolesDto
{
    [Required]
    [MinLength(1)]
    public List<string> Roles { get; set; }
}