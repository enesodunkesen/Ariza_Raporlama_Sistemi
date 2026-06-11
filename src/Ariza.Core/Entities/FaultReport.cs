using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ariza.Core.Entities
{
    public class FaultReport
    {
        [Key]
        public int Id { get; set; }

        public string Description { get; set; } = string.Empty;

        public string? BandNumber { get; set; }

        public string? ProductCode { get; set; }

        public string? ErrorCode { get; set; }

        public FaultStatus Status { get; set; } = FaultStatus.Pending;

        public string? ImagePath { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public AppUser? User { get; set; }

        public ICollection<MaintenanceRequest>? MaintenanceRequests { get; set; }
    }
}
