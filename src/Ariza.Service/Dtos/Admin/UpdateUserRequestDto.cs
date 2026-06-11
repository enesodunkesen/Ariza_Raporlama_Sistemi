using System.ComponentModel.DataAnnotations;

namespace Ariza.Service.Dtos.Admin
{
    public class UpdateUserRequestDto
    {
        public string? BandNumber { get; set; }

        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
