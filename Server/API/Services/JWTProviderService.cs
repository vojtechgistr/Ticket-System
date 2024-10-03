using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DataAccessLibrary.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public interface IJWTProviderService
{
    public JwtSecurityToken GetToken(IEnumerable<Claim> authClaims);
    public Task<JwtSecurityToken> GetTokenAsync(ApplicationUser user);
}

public class JWTProviderService : IJWTProviderService
{
    private readonly UserManager<ApplicationUser> userManager;
    private readonly IConfiguration configuration;

    public JWTProviderService(IConfiguration configuration, UserManager<ApplicationUser> userManager)
    {
        this.userManager = userManager;
        this.configuration = configuration;
    }

    public JwtSecurityToken GetToken(IEnumerable<Claim> authClaims)
    {
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"]));

        var token = new JwtSecurityToken(
            issuer: configuration["JWT:ValidIssuer"],
            audience: configuration["JWT:ValidAudience"],
            expires: DateTime.Now.AddDays(int.Parse(configuration["JWT:Cookie:DaysToExpire"])),
            claims: authClaims,
            signingCredentials: new(authSigningKey, SecurityAlgorithms.HmacSha256));

        return token;
    }
    
    public async Task<JwtSecurityToken> GetTokenAsync(ApplicationUser user)
    {
        var userRoles = await userManager.GetRolesAsync(user);
        var authClaims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        
        authClaims.AddRange(userRoles.Select(userRole => new Claim(ClaimTypes.Role, userRole)));
        
        return GetToken(authClaims);
    }
}