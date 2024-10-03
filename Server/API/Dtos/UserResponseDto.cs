using DataAccessLibrary.Structures;

namespace API.Dtos;

public class UserResponseDto
{
    public string Id { get; init; }
    public string DisplayName { get; init; }
    public string Email { get; init; }
    public string Tag { get; init; }
    public IList<string>? Roles { get; init; }
    public CreatedAt CreatedAt { get; init; }
    public string? AvatarUrl { get; init; }
    
    public string? BannerColor { get; init; }
}