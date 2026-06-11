using System.ComponentModel.DataAnnotations;

namespace Ariza.Service.Dtos.Auth
{
    public class RegisterRequestDto
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string BandNumber { get; set; } = string.Empty;
    }
}