// Example of RabbitMQ - deliver notifications

using System.Text;
using MessagingService;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

var factory = new ConnectionFactory()
{
    HostName = "localhost",
};

using IConnection connection = factory.CreateConnection();
using IModel channel = connection.CreateModel();

const string exchangeName = "messages_direct";
const string queueName = "MessageQueue";
const string routingKey =
    "kowUpvD3kp0zfduE1RW4j514VOM9ymzX5uodXxLg7Q5zqveNYmXblVl9Vs5hyw4DxnQvkJ9W4zjUUts67EFO9A20Bl39qLoMBslapfnuQ3aP1G3pWeoomb9pOiBnmj1v";

channel.ExchangeDeclare(exchangeName, ExchangeType.Direct, true);
channel.QueueDeclare(queueName, true, false, false, null);
channel.QueueBind(queueName, exchangeName, routingKey, null);
channel.BasicQos(0, 1, false);

var emailSender = new EmailSender();

var consumer = new EventingBasicConsumer(channel);
consumer.Received += async (sender, args) =>
{
    byte[] body = args.Body.ToArray();
    string jsonRequest = Encoding.UTF8.GetString(body);

    try
    {
        var obj = Newtonsoft.Json.JsonConvert.DeserializeObject<MessageDto>(jsonRequest);
        if (obj == null)
        {
            throw new ArgumentException("Invalid request.");
        }
        
        Console.WriteLine($"Received ticket from '{obj.AuthorName}' (email: {obj.AuthorEmail})");

        const string emailSubject = "Ticket sent! - Confirmation";
        string emailBody =
            $"We are sending you a confirmation that your ticket was successfully submitted.\n\nTitle: {obj.Title}\nContent: {obj.Content}\nSubmitted (Date): {obj.PostDate:“MMMM d, yyyy HH:mm}";

        await emailSender.SendEmailAsync(obj.AuthorEmail, emailSubject, emailBody);
        Console.WriteLine($"Sent email to ('{obj.AuthorEmail}')");
        
        channel.BasicAck(args.DeliveryTag, false);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Could not process request: '{jsonRequest}', therefore discarding it.");
        Console.WriteLine($"[Error]: {ex.Message}");
        channel.BasicReject(args.DeliveryTag, false);
    }
};

string consumerTag = channel.BasicConsume(queueName, false, consumer);

while (true)
{
    Console.WriteLine("Type 'Exit' to turn off the application.");
    var msg = Console.ReadLine();
    if (msg == null || msg.ToLower() != "exit")
    {
        continue;
    }

    break;
}

channel.BasicCancel(consumerTag);
channel.Close();
connection.Close();