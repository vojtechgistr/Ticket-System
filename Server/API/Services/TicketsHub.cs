using API.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.Services;

[Authorize(Policy = "AdminRights")]
public class TicketsHub : Hub
{
    public async Task SendMessage(string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", message);
    }
    
    public async Task SendTicketMessage(TicketDto ticket)
    {
        string jsonMessage = Newtonsoft.Json.JsonConvert.SerializeObject(ticket);
        await Clients.All.SendAsync("ReceiveMQTicket", jsonMessage);
    }
}