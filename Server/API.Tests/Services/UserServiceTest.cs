using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using API.Dtos;
using API.Services;
using Autofac.Extras.Moq;
using Castle.Core.Configuration;
using DataAccessLibrary.DataAccess;
using DataAccessLibrary.Models;
using DataAccessLibrary.Services;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;

namespace API.Tests.Services;

// Example of unit testing & mocking data

[TestSubject(typeof(UserService))]
public class UserServiceTest
{
    [Fact]
    public async Task GetAsync_ValidCall()
    {
        var users = new List<ApplicationUser>() { GetSampleUser() };
        var userManager = MockUserManager(users);
        userManager.Setup(x => x.FindByIdAsync(It.IsAny<string>()))
            .ReturnsAsync(users[0]);

        var cls = new UserService(userManager.Object,
            new Mock<JWTProviderService>(new Mock<IConfiguration>().Object, userManager.Object).Object);

        var actualResponse = await cls.GetAsync(GetSampleId());

        var expectedUser = users[0];
        var expectedResponse = new UserResponseDto()
        {
            Id = expectedUser.Id,
            DisplayName = expectedUser.DisplayName,
            CreatedAt = IdProviderService.GetCreatedAt(expectedUser.Id),
            Tag = expectedUser.Tag,
            Email = expectedUser.Email,
            Roles = GetSampleRoles(),
            AvatarUrl = expectedUser.AvatarUrl,
        };

        var properties = typeof(UserResponseDto).GetProperties();
        foreach (var property in properties)
        {
            var actualProp = property.GetValue(actualResponse);
            var expectedProp = property.GetValue(expectedResponse);
            Assert.Equal(expectedProp, actualProp);
        }
    }

    [Fact]
    public async Task GetAsync_Exception()
    {
        var users = new List<ApplicationUser>() { GetSampleUser() };
        users[0].Id = "InvalidID";
        var userManager = MockUserManager(users);
        userManager.Setup((x) => x.FindByIdAsync(It.IsAny<string>()))
            .Returns(Task.FromResult<ApplicationUser>(null));

        var cls = new UserService(userManager.Object,
            new Mock<JWTProviderService>(new Mock<IConfiguration>().Object, userManager.Object).Object);

        try
        {
            await cls.GetAsync(users[0].Id);
            throw new Exception("Invalid ID check didn't pass.");
        }
        catch (Exception ex)
        {
            Assert.Equal($"User does not exist (id: {users[0].Id}).", ex.Message);
        }
    }

    private string GetSampleId()
    {
        return "1285241077815213463";
    }

    private IList<string> GetSampleRoles()
    {
        return new List<string>() { "Admin", "User" };
    }

    private ApplicationUser GetSampleUser()
    {
        return new ApplicationUser()
        {
            Id = this.GetSampleId(),
            Tag = "1234",
            Email = "test@gmail.com",
            UserName = "test@gmail.com",
            DisplayName = "Test User",
            AvatarUrl = "/assets/images/default-profile.webp",
            SecurityStamp = Guid.NewGuid().ToString()
        };
    }

    private Mock<UserManager<TUser>> MockUserManager<TUser>(List<TUser> users)
        where TUser : class
    {
        var manager = new Mock<UserManager<TUser>>(
            new Mock<IUserStore<TUser>>().Object,
            new Mock<IOptions<IdentityOptions>>().Object,
            new Mock<IPasswordHasher<TUser>>().Object,
            new IUserValidator<TUser>[0],
            new IPasswordValidator<TUser>[0],
            new Mock<ILookupNormalizer>().Object,
            new Mock<IdentityErrorDescriber>().Object,
            new Mock<IServiceProvider>().Object,
            new Mock<ILogger<UserManager<TUser>>>().Object);

        manager.Setup(x => x.DeleteAsync(It.IsAny<TUser>())).ReturnsAsync(IdentityResult.Success);
        manager.Setup(x => x.CreateAsync(It.IsAny<TUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success)
            .Callback<TUser, string>((x, y) => users.Add(x));
        manager.Setup(x => x.UpdateAsync(It.IsAny<TUser>())).ReturnsAsync(IdentityResult.Success);

        manager.Setup(x => x.GetRolesAsync(It.IsAny<TUser>()))
            .ReturnsAsync(GetSampleRoles());

        return manager;
    }
}