using DataAccessLibrary.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLibrary.Extensions;

public static class UserManagerExtensions
{
    public static async Task<ApplicationUser?> FindByDisplayNameAndTag(this UserManager<ApplicationUser> userManager, string displayName, string tag)
    {
        return await userManager.Users.SingleOrDefaultAsync(user => user.DisplayName == displayName && user.Tag == tag);
    } 
}