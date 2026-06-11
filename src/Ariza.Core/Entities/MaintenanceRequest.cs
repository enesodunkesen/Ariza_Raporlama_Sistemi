using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ariza.Core.Entities
{
    public class MaintenanceRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ReportId { get; set; }

        [ForeignKey("ReportId")]
        public FaultReport? Report { get; set; }

        public string RequestText { get; set; } = string.Empty;

        public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Pending;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string CreatedById { get; set; } = string.Empty;

        [ForeignKey("CreatedById")]
        public AppUser? CreatedBy { get; set; }
    }
}
