using System.Text.Json;
using System.Text.Json.Serialization;

namespace RPS.WebAPI.Converters
{
    /// <summary>
    /// Custom JSON converter that ensures DateTime values are serialized as ISO 8601 UTC format with Z suffix.
    /// This ensures proper timezone conversion on the frontend.
    /// </summary>
    public class UtcDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            string? dateStr = reader.GetString();
            if (string.IsNullOrEmpty(dateStr))
            {
                return DateTime.UnixEpoch;
            }
            return DateTime.Parse(dateStr).ToUniversalTime();
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            // Ensure the datetime is treated as UTC if unspecified, then output in 'O' format (ISO 8601 with Z)
            DateTime utcValue = value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
                : value.ToUniversalTime();
            writer.WriteStringValue(utcValue.ToString("O"));
        }
    }
}
