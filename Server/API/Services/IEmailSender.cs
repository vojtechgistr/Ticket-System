using System.Text;
using RabbitMQ.Client;

namespace API.Services;

public interface IEmailSender
{
    public void Send<T>(T message)
        where T : class;
}

public class EmailSender : IEmailSender
{
    private const string ExchangeName = "messages_direct";
    private const string QueueName = "MessageQueue";

    private const string RoutingKey =
        "kowUpvD3kp0zfduE1RW4j514VOM9ymzX5uodXxLg7Q5zqveNYmXblVl9Vs5hyw4DxnQvkJ9W4zjUUts67EFO9A20Bl39qLoMBslapfnuQ3aP1G3pWeoomb9pOiBnmj1v";

    private readonly IModel channel;

    public EmailSender()
    {
        ConnectionFactory connectionFactory = new()
        {
            HostName = "localhost"
        };

        var connection = connectionFactory.CreateConnection();
        channel = connection.CreateModel();
        Initialize();
    }

    private void Initialize()
    {
        channel.ExchangeDeclare(ExchangeName, ExchangeType.Direct, true);
        channel.QueueDeclare(QueueName, true, false, false, null);
        channel.QueueBind(QueueName, ExchangeName, RoutingKey, null);
    }

    public void Send<T>(T message)
        where T : class
    {
        string jsonMessage = Newtonsoft.Json.JsonConvert.SerializeObject(message);
        byte[] body = Encoding.UTF8.GetBytes(jsonMessage);

        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;

        channel.BasicPublish(ExchangeName, RoutingKey, properties, body);
    }
}