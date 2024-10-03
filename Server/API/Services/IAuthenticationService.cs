using System.IdentityModel.Tokens.Jwt;
using API.Dtos;
using API.Helpers;
using DataAccessLibrary.Extensions;
using DataAccessLibrary.Models;
using DataAccessLibrary.Services;
using DataAccessLibrary.Structures;
using Microsoft.AspNetCore.Identity;

namespace API.Services;

public interface IAuthenticationService
{
    Task<string> Login(LoginRequestDto requestDto);
    Task<string> Register(RegisterRequestDto requestDto);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<ApplicationUser> userManager;
    private readonly IConfiguration configuration;
    private readonly IIdProviderService idProviderService;
    private readonly ITagProviderService tagProviderService;
    private readonly IJWTProviderService jwtProviderService;

    public AuthenticationService(UserManager<ApplicationUser> userManager, IConfiguration configuration,
        IIdProviderService idProviderService, ITagProviderService tagProviderService, IJWTProviderService jwtProviderService)
    {
        this.userManager = userManager;
        this.configuration = configuration;
        this.idProviderService = idProviderService;
        this.tagProviderService = tagProviderService;
        this.jwtProviderService = jwtProviderService;
    }

    public async Task<string> Login(LoginRequestDto requestDto)
    {
        var user = await userManager.FindByEmailAsync(requestDto.Email);

        if (user is null || !await userManager.CheckPasswordAsync(user, requestDto.Password))
        {
            throw new ArgumentException($"The email or password is incorrect.");
        }

        var token = await jwtProviderService.GetTokenAsync(user);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<string> Register(RegisterRequestDto requestDto)
    {
        var userByEmail = await userManager.FindByEmailAsync(requestDto.Email);
        if (userByEmail is not null)
        {
            throw new ArgumentException($"This email is already taken.");
        }

        string? userTag = null;
        for (int i = 0; i < 10000; i++)
        {
            var tag = tagProviderService.CreateTag();
            var userByNameAndTag = await userManager.FindByDisplayNameAndTag(requestDto.DisplayName, tag);
            if (userByNameAndTag is null)
            {
                userTag = tag;
                break;
            }
        }

        if (userTag is null)
        {
            throw new ArgumentException($"This username is not available right now.");
        }
        
        ApplicationUser user = new()
        {
            Id = idProviderService.CreateId(),
            Tag = userTag,
            Email = requestDto.Email,
            UserName = requestDto.Email,
            DisplayName = requestDto.DisplayName,
            AvatarUrl = "/assets/images/default-profile.webp",
            SecurityStamp = Guid.NewGuid().ToString()
        };

        var result = await userManager.CreateAsync(user, requestDto.Password);

        if (!result.Succeeded)
        {
            throw new ArgumentException(ResultHelper.GetErrorsText(result.Errors));
        }

        await userManager.AddToRoleAsync(user, RoleTypes.User);
        return await Login(new LoginRequestDto { Email = requestDto.Email, Password = requestDto.Password });
    }
}