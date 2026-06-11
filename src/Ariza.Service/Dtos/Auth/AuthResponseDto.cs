namespace Ariza.Service.Dtos.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;

        public DateTime Expiration { get; set; }

        public string UserId { get; set; } = string.Empty;

        public string UserName { get; set; } = string.Empty;

        public string? Role { get; set; }
    }
}