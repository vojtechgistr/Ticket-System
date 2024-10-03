using System.IdentityModel.Tokens.Jwt;
using API.Dtos;
using API.Helpers;
using DataAccessLibrary.Extensions;
using DataAccessLibrary.Models;
using DataAccessLibrary.Services;
using Microsoft.AspNetCore.Identity;

namespace API.Services;

public interface IUserService
{
    public Task<UserResponseDto> GetAsync(string id);
    public Task UpdateAsync(string id, UpdateUserRequestDto requestDto);
    public Task<string> UpdateRolesAsync(string id, UpdateRolesDto requestDto);
    public Task UpdatePasswordAsync(string id, ChangePasswordRequestDto requestDto);
    public Task DeleteAsync(string id);
}

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> userManager;
    private readonly IJWTProviderService jwtProviderService;

    public UserService(UserManager<ApplicationUser> userManager, IJWTProviderService jwtProviderService)
    {
        this.userManager = userManager;
        this.jwtProviderService = jwtProviderService;
    }

    public async Task<UserResponseDto> GetAsync(string id)
    {
        ApplicationUser user = await GetUserById(id);
        var userRoles = await userManager.GetRolesAsync(user);
        return new()
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            CreatedAt = IdProviderService.GetCreatedAt(user.Id),
            Tag = user.Tag,
            Email = user.Email,
            Roles = userRoles,
            AvatarUrl = user.AvatarUrl,
            BannerColor = user.BannerColor,
        };
    }

    public async Task UpdateAsync(string id, UpdateUserRequestDto requestDto)
    {
        // TODO: check if logged in user can actually edit this one
        ApplicationUser user = await GetUserById(id);
        List<string> Errors = new();

        if (requestDto.Email is not null)
        {
            if (await userManager.FindByEmailAsync(requestDto.Email) is null)
            {
                user.Email = requestDto.Email;
            }
            else
            {
                Errors.Add("This email is already taken.");
            }
        }

        if (requestDto.Tag is not null)
        {
            string displayName = requestDto.DisplayName ?? user.DisplayName;
            if (await userManager.FindByDisplayNameAndTag(displayName, requestDto.Tag) is null)
            {
                user.Tag = requestDto.Tag;
            }
            else
            {
                Errors.Add("This tag for this username is already taken.");
            }
        }

        if (requestDto.DisplayName is not null)
        {
            string targetTag = requestDto.Tag ?? user.Tag;
            if (await userManager.FindByDisplayNameAndTag(requestDto.DisplayName, targetTag) is null)
            {
                user.DisplayName = requestDto.DisplayName;
            }
            else
            {
                Errors.Add("This username with this tag is not available right now.");
            }
        }

        if (requestDto.AvatarUrl is not null)
        {
            user.AvatarUrl = requestDto.AvatarUrl;
        }
        
        if (requestDto.BannerColor is not null)
        {
            user.BannerColor = requestDto.BannerColor;
        }

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new ArgumentException(ResultHelper.GetErrorsText(result.Errors));
        }

        if (Errors.Any())
        {
            throw new ArgumentException(ResultHelper.GetErrorsText(Errors));
        }
    }

    public async Task<string> UpdateRolesAsync(string id, UpdateRolesDto requestDto)
    {
        ApplicationUser user = await GetUserById(id);
        var userRoles = await userManager.GetRolesAsync(user);

        // TODO: check what roles user can actually remove / add
        IEnumerable<string> toAdd = requestDto.Roles.Where(role => !userRoles.Contains(role));
        IEnumerable<string> toRemove = userRoles.Where(role => !requestDto.Roles.Contains(role));

        var addActionResult = await userManager.AddToRolesAsync(user, toAdd);

        if (!addActionResult.Succeeded)
        {
            throw new Exception(ResultHelper.GetErrorsText(addActionResult.Errors));
        }

        var removeActionResult = await userManager.RemoveFromRolesAsync(user, toRemove);
        if (!removeActionResult.Succeeded)
        {
            throw new Exception(ResultHelper.GetErrorsText(removeActionResult.Errors));
        }

        var token = await jwtProviderService.GetTokenAsync(user);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task UpdatePasswordAsync(string id, ChangePasswordRequestDto requestDto)
    {
        ApplicationUser user = await GetUserById(id);
        var result = await userManager.ChangePasswordAsync(user, requestDto.OldPassword, requestDto.Password);
        if (!result.Succeeded)
        {
            throw new ArgumentException(ResultHelper.GetErrorsText(result.Errors));
        }
    }

    public async Task DeleteAsync(string id)
    {
        ApplicationUser user = await GetUserById(id);
        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            throw new ArgumentException(ResultHelper.GetErrorsText(result.Errors));
        }
    }

    private async Task<ApplicationUser> GetUserById(string id)
    {
        ApplicationUser? user = await userManager.FindByIdAsync(id);
        if (user is null)
        {
            throw new ArgumentException($"User does not exist (id: {id}).");
        }

        return user;
    }
}