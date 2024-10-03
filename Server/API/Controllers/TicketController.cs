using System.Security.Claims;
using API.Dtos;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketController : ControllerBase
{
    private readonly IEmailSender emailSender;
    private readonly IUserService userService;
    private readonly ITicketDatabase ticketDatabase;
    private readonly TicketsHub ticketHub;
    private const string TicketIndexName = "user-ticket-index";

    public TicketController(IEmailSender emailSender, IUserService userService, ITicketDatabase ticketDatabase, TicketsHub ticketHub)
    {
        this.emailSender = emailSender;
        this.userService = userService;
        this.ticketDatabase = ticketDatabase;
        this.ticketHub = ticketHub;
    }

    [Authorize]
    [HttpPost("send")]
    public async Task<IActionResult> Send([FromBody] TicketDto ticket)
    {
        try
        {
            string? userId = GetUserId();
            var user = await userService.GetAsync(userId);

            ticket.AuthorName ??= $"{user.DisplayName}#{user.Tag}";
            ticket.AuthorEmail ??= user.Email;

            await ticketDatabase.SaveAsync(ticket, TicketIndexName);
            emailSender.Send(ticket);
            ticketHub.SendTicketMessage(ticket);
        }
        catch (Exception ex)
        {
            return BadRequest(new GenericResponseDto(ex.Message));
        }

        return Accepted(
            new GenericResponseDto<string>("Your ticket is in processing. It will be accepted as soon as possible."));
    }

    [Authorize(Policy = "AdminRights")]
    [HttpGet("get/all")]
    public async Task<IActionResult> Get()
    {
        try
        {
            var res = await ticketDatabase.LoadAsync<TicketDto>(TicketIndexName);
            return Ok(res);
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