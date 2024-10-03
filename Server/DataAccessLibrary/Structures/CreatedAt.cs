namespace DataAccessLibrary.Structures;

public readonly struct CreatedAt
{
    public long Timestamp { get; internal init; }
    public DateTime DateTime { get; internal init; }
}