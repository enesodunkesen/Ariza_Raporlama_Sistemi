using System.ComponentModel.DataAnnotations;

namespace Ariza.Service.Dtos.Admin
{
    public class UpdateReportStatusRequestDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
