namespace Ariza.Service.Dtos.Admin
{
    public class AdminUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? BandNumber { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
