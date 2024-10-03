using Elastic.Transport;

namespace API.Services;

using Elastic.Clients.Elasticsearch;

public interface ITicketDatabase
{
    /// <summary>
    /// Saves asynchronously object to the database.
    /// </summary>
    /// <exception cref="ArgumentException">If not successful</exception>
    public Task SaveAsync<DType>(DType obj, string index)
        where DType : class;

    /// <summary>
    /// Loads asynchronously set of objects from the database.
    /// </summary>
    /// <exception cref="ArgumentException">If not successful</exception>
    public Task<IReadOnlyCollection<DType>> LoadAsync<DType>(string index)
        where DType : class;
}

/// <inheritdoc cref="ITicketDatabase"/>
public class ElasticTicketDatabase : ITicketDatabase
{
    private readonly ElasticsearchClient client;

    public ElasticTicketDatabase()
    {
        var settings = new ElasticsearchClientSettings(new Uri("http://localhost:9200"))
            .Authentication(new BasicAuthentication("elastic", "mypassword"));

        this.client = new(settings);
    }

    public async Task SaveAsync<DType>(DType obj, string index)
        where DType : class
    {
        var response = await client.IndexAsync(obj, i =>
            i.Index(index));

        if (!response.IsValidResponse)
        {
            throw new ArgumentException(string.Join(". ", response.ElasticsearchWarnings));
        }
    }

    public async Task<IReadOnlyCollection<DType>> LoadAsync<DType>(string index)
        where DType : class
    {
        var response = await client.SearchAsync<DType>(s => s
            .From(0)
            .Size(1000)
            .Index(index)
        );

        if (!response.IsValidResponse)
        {
            throw new ArgumentException(string.Join(". ", response.ElasticsearchServerError?.Error));
        }

        return response.Documents;
    }
}