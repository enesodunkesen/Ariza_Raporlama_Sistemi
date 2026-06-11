using System.ComponentModel.DataAnnotations;

namespace Ariza.Service.Dtos.Admin
{
    public class CreateUserRequestDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public string? BandNumber { get; set; }

        [Required]
        public string Role { get; set; } = "User"; // "Admin", "User" or "Chief"
    }
}
