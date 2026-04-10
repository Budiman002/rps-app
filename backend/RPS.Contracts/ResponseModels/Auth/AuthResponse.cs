namespace RPS.Contracts.ResponseModels.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
