using System.ComponentModel.DataAnnotations;

namespace Ariza.Service.Dtos.Admin
{
    public class UpdateMaintenanceRequestStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
