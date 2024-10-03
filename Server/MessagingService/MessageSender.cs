using System.Text;
using RabbitMQ.Client;

namespace MessagingService;

/// <summary>
/// Passes processed messages to subscribers.
/// </summary>
public class MessageSender : IDisposable
{
    private const string ExchangeName = "messages_fanout";
    private const string RoutingKey = "";
    private readonly IConnection connection;
    private readonly IModel channel;
    private bool isDisposed = false;

    public MessageSender()
    {
        var factory = new ConnectionFactory()
        {
            HostName = "localhost",
        };

        this.connection = factory.CreateConnection();
        this.channel = connection.CreateModel();
        channel.ExchangeDeclare(ExchangeName, ExchangeType.Fanout);
    }

    public void Send(string message)
    {
        byte[] body = Encoding.UTF8.GetBytes(message);
        channel.BasicPublish(ExchangeName, RoutingKey, false, null, body);
        Console.WriteLine($"Sent message - '{message}'");
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
            connection?.Dispose();
            channel?.Dispose();
        }

        isDisposed = true;
    }
}