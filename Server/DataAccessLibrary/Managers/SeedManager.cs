using System.Runtime.InteropServices;
using DataAccessLibrary.DataAccess;
using DataAccessLibrary.Models;
using DataAccessLibrary.Services;
using DataAccessLibrary.Structures;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DataAccessLibrary.Managers;

/// <summary>
/// Create default user with roles.
/// </summary>
public static class SeedManager
{
    public static async Task Seed(IServiceProvider serviceProvider)
    {
        await SeedRoles(serviceProvider);
        await SeedOwnerUser(serviceProvider);
    }

    private static async Task SeedRoles(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        await roleManager.CreateAsync(new ApplicationRole(RoleTypes.Owner));
        await roleManager.CreateAsync(new ApplicationRole(RoleTypes.Admin));
        await roleManager.CreateAsync(new ApplicationRole(RoleTypes.Moderator));
        await roleManager.CreateAsync(new ApplicationRole(RoleTypes.User));
    }

    private static async Task SeedOwnerUser(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<DataContext>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var idProvider = serviceProvider.GetRequiredService<IIdProviderService>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();   // require roles to exist

        var ownerUser = await context.Users.FirstOrDefaultAsync(u => u.UserName == "Owner");
        if (ownerUser is null)
        {
            ownerUser = new ApplicationUser
            {
                Id = idProvider.CreateId(),
                Tag = "0001",
                UserName = "Owner",
                DisplayName = "Owner",
                Email = "owner@void.com",
                AvatarUrl = "/assets/images/default-profile.webp",
                SecurityStamp = Guid.NewGuid().ToString(),
            };

            var result = await userManager.CreateAsync(ownerUser, "Owner-1234");
            if (!result.Succeeded)
            {
                throw new ArgumentException(string.Join(" ", result.Errors.Select(error => error.Description).ToArray()));
            }

            await userManager.AddToRoleAsync(ownerUser, RoleTypes.Owner);
            await userManager.AddToRoleAsync(ownerUser, RoleTypes.Admin);
            await userManager.AddToRoleAsync(ownerUser, RoleTypes.Moderator);
            await userManager.AddToRoleAsync(ownerUser, RoleTypes.User);
        }
    }
}