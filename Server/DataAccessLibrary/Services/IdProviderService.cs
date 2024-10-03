using System.Numerics;
using System.Text;
using DataAccessLibrary.Structures;

namespace DataAccessLibrary.Services;

/// <summary>
/// Service providing Snowflake type IDs
/// </summary>
public interface IIdProviderService
{
    public string CreateId();
}

/// <inheritdoc cref="ITagProviderService"/>
public class IdProviderService : IIdProviderService
{
    private const long Epoch = 1420070400000;

    public string CreateId()
    {
        long timestamp = (long)DateTime.UtcNow.Subtract(
                new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc))
            .TotalMilliseconds;

        string timeSinceEpoch = LongToBinary(timestamp - Epoch);
        string internalWorkerId = LongToBinary((timestamp & 0x3E0000) >> 17);
        string internalProcessId = LongToBinary((timestamp & 0x1F000) >> 12);
        string increment = LongToBinary(timestamp & 0xFFF);

        AddLeadingZeros(ref internalWorkerId, 5);
        AddLeadingZeros(ref internalProcessId, 5);
        AddLeadingZeros(ref increment, 12);

        return $"{timeSinceEpoch}{internalWorkerId}{internalProcessId}{increment}"
            .FromBinaryStringToBigInteger()
            .ToString();
    }

    /// <summary>
    /// Convert ID back into creation date. 
    /// </summary>
    /// <param name="snowflakeId"><see cref="string"/></param>
    /// <returns>Timestamp and <see cref="DateTime"/></returns>
    public static CreatedAt GetCreatedAt(string snowflakeId)
    {
        string idAsBinary = BigInteger.Parse(snowflakeId).ToBinaryString();
        string timestampPart = idAsBinary[..^22];
        long timeSinceEpoch = BinaryToLong(timestampPart) + Epoch;
        DateTime dateTime = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds(timeSinceEpoch);

        return new()
        {
            Timestamp = timeSinceEpoch,
            DateTime = dateTime,
        };
    }

    private static void AddLeadingZeros(ref string binaryValue, int targetLength)
    {
        while (binaryValue.Length < targetLength)
        {
            binaryValue = $"0{binaryValue}";
        }
    }

    private static string LongToBinary(long value)
    {
        return Convert.ToString(value, 2);
    }

    private static long BinaryToLong(string value)
    {
        return Convert.ToInt64(value, 2);
    }
}

/// <summary>
/// Extension methods to convert <see cref="System.Numerics.BigInteger"/>
/// instances to binary string and back.
/// </summary>
public static class BigIntegerExtensions
{
    /// <summary>
    /// Converts a <see cref="BigInteger"/> to a binary string.
    /// </summary>
    /// <param name="bigint">A <see cref="BigInteger"/>.</param>
    /// <returns>
    /// A <see cref="System.String"/> containing a binary
    /// representation of the supplied <see cref="BigInteger"/>.
    /// </returns>
    public static string ToBinaryString(this BigInteger bigint)
    {
        var bytes = bigint.ToByteArray();
        var idx = bytes.Length - 1;
        var base2 = new StringBuilder(bytes.Length * 8);
        var binary = Convert.ToString(bytes[idx], 2);
        base2.Append(binary);
        for (idx--; idx >= 0; idx--)
        {
            base2.Append(Convert.ToString(bytes[idx], 2).PadLeft(8, '0'));
        }

        return base2.ToString();
    }

    /// <summary>
    /// Converts a binary <see cref="string"/> to a <see cref="BigInteger"/>
    /// </summary>
    /// <param name="binaryString"><see cref="String"/></param>
    /// <returns>
    /// A <see cref="BigInteger"/> containing a representation of the supplied binary <see cref="String"/>
    /// </returns>
    public static BigInteger FromBinaryStringToBigInteger(this string binaryString)
    {
        BigInteger res = 0;
        foreach (char c in binaryString)
        {
            res <<= 1;
            res += c == '1' ? 1 : 0;
        }

        return res;
    }
}