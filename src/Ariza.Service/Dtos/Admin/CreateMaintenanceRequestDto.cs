using System.ComponentModel.DataAnnotations;

namespace Ariza.Service.Dtos.Admin
{
    public class CreateMaintenanceRequestDto
    {
        [Required]
        public int ReportId { get; set; }

        [Required]
        [StringLength(2000, MinimumLength = 5)]
        public string RequestText { get; set; } = string.Empty;
    }
}