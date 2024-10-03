namespace API.Dtos;

/// <summary>
/// API Response containing only errors.
/// </summary>
public class GenericResponseDto
{
    public List<string> Errors { get; set; }

    public GenericResponseDto(List<string> errors)
    {
        Errors = errors;
    }

    public GenericResponseDto(string error)
    {
        Errors = new() { error };
    }
}

/// <summary>
/// API Response containing some response message with optional errors.
/// </summary>
public class GenericResponseDto<T>
{
    public T Content { get; set; }
    public List<string>? Errors { get; set; }

    public GenericResponseDto(T content, List<string>? errors = null)
    {
        Content = content;
        Errors = errors;
    }
    
    
    public GenericResponseDto(T content, string error)
    {
        Content = content;
        Errors = new() { error };
    }
}