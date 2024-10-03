namespace DataAccessLibrary.Services;

/// <summary>
/// Service providing unique tags for users.
/// </summary>
public interface ITagProviderService
{
    public string CreateTag();
}

/// <inheritdoc cref="ITagProviderService"/>
public class TagProviderService: ITagProviderService
{
    private readonly Random random = new();
    
    public string CreateTag()
    {
        string tag = random.Next(10000).ToString();
        while (tag.Length < 4)
        {
            tag = $"0{tag}";
        }

        return tag;
    }
}