using Microsoft.AspNetCore.Identity;

namespace API.Helpers;

/// <summary>
/// Helper for handling API results.
/// </summary>
public static class ResultHelper
{
    /// <summary>
    /// Converts <see cref="IdentityError"/> into readable format.
    /// </summary>
    /// <param name="errors"><see cref="IdentityError"/></param>
    /// <returns></returns>
    public static string GetErrorsText(IEnumerable<IdentityError> errors)
    {
        return string.Join(", ", errors.Select(error => error.Description).ToArray());
    }
    
    /// <summary>
    /// Converts a list of <see cref="string"/> errors into readable format.
    /// </summary>
    /// <param name="errors"><see cref="IEnumerable{String}"/> of type <see cref="string"/></param>
    /// <returns></returns>
    public static string GetErrorsText(IEnumerable<string> errors)
    {
        return string.Join(" ", errors);
    }
}