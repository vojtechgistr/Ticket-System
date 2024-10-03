using System.Security.Claims;
using API.Dtos;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IAuthenticationService authenticationService;
    private readonly IUserService userService;
    private readonly IFileUploadService fileUploadService;

    public UserController(
        IAuthenticationService authenticationService,
        IUserService userService,
        IFileUploadService fileUploadService)
    {
        this.authenticationService = authenticationService;
        this.userService = userService;
        this.fileUploadService = fileUploadService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto requestDto)
    {
        try
        {
            string jwtToken = await authenticationService.Login(requestDto);
            return Ok(new GenericResponseDto<string>(jwtToken));
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }
    }

    [AllowAnonymous]
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto requestDto)
    {
        try
        {
            string jwtToken = await authenticationService.Register(requestDto);
            return Ok(new GenericResponseDto<string>(jwtToken));
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }
    }
    
    [Authorize]
    [HttpGet("current")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GenericResponseDto<UserResponseDto>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            string userId = GetUserId();
            var user = await userService.GetAsync(userId);
            return Ok(new GenericResponseDto<UserResponseDto>(user));
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("info/update")]
    public async Task<IActionResult> UpdateUserInfo([FromBody] UpdateUserRequestDto updateUserRequestDto)
    {
        try
        {
            string userId = GetUserId();
            await userService.UpdateAsync(userId, updateUserRequestDto);
            return Ok(new GenericResponseDto<string>("Successfully updated account info."));
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("roles/update")]
    public async Task<IActionResult> UpdateRoles([FromBody] UpdateRolesDto updateRolesDto)
    {
        try
        {
            string userId = GetUserId();
            string jwtToken = await userService.UpdateRolesAsync(userId, updateRolesDto);
            return Ok(new GenericResponseDto<string>(jwtToken));
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("password/update")]
    public async Task<IActionResult> UpdatePassword([FromBody] ChangePasswordRequestDto changePasswordRequestDto)
    {
        try
        {
            string userId = GetUserId();
            await userService.UpdatePasswordAsync(userId, changePasswordRequestDto);
            return Ok(new GenericResponseDto<string>("Password was successfully changed."));
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("avatar/update")]
    public async Task<IActionResult> UpdateAvatar([FromForm] IFormFile avatar)
    {
        try
        {
            string userId = GetUserId();
            string avatarUrl = await fileUploadService.UploadImageAsync(avatar);
            await userService.UpdateAsync(userId, new() { AvatarUrl = avatarUrl });
            return Ok(new GenericResponseDto<string>("Avatar was successfully changed."));
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }
    }
    
    [Authorize]
    [HttpPost("delete")]
    public async Task<IActionResult> Delete()
    {
        try
        {
            string userId = GetUserId();
            await userService.DeleteAsync(userId);
            return Ok(new GenericResponseDto<string>("Account was successfully deleted."));
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }
    }

    private string GetUserId()
    {
        string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            throw new Exception("Invalid token. Try refreshing your browser or Log in again.");
        }

        return userId;
    }
}