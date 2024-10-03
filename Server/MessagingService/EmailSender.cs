using System.Net;
using System.Net.Mail;

namespace MessagingService;

/// <summary>
/// Handles email notifications.
/// </summary>
public class EmailSender : IDisposable
{
    private readonly SmtpClient client = new("smtp.gmail.com", 587)
    {
        EnableSsl = true,
        Credentials = new NetworkCredential(Email, Password)
    };

    private const string Email = "vojtikcz4@gmail.com";
    private const string Password = "uokrdzziboupwcok";
    private bool isDisposed = false;
    
    public async Task SendEmailAsync(string email, string subject, string body)
    {
        var mailMessage = new MailMessage(from: Email, to: email, subject: subject, body: body);
        await client.SendMailAsync(mailMessage);
    }

    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (isDisposed)
        {
            return;
        }

        if (disposing)
        {
            client.Dispose();
        }

        isDisposed = true;
    }
}