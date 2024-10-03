namespace MessagingService;

public class MessageDto
{
    public MessageDto(string title, string content, string authorName, string authorEmail, DateTime postDate)
    {
        AuthorEmail = authorEmail;
        Title = title;
        Content = content;
        AuthorName = authorName;
        PostDate = postDate;
    }

    public string Title { get; set; }
    public string Content { get; set; }
    public string AuthorName { get; set; }
    public string AuthorEmail { get; set; }
    public DateTime PostDate { get; set; }
}