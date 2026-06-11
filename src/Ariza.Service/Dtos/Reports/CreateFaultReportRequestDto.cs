using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Ariza.Service.Dtos.Reports
{
    public class CreateFaultReportRequestDto
    {
        [Required]
        [StringLength(2000, MinimumLength = 10)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string? ProductCode { get; set; }

        [StringLength(50)]
        public string? ErrorCode { get; set; }

        public IFormFile? Image { get; set; }
    }
}