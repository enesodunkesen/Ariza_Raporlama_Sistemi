namespace Ariza.Service.Dtos.Reports
{
    public class FaultReportDto
    {
        public int Id { get; set; }

        public string Description { get; set; } = string.Empty;

        public string? BandNumber { get; set; }

        public string? ProductCode { get; set; }

        public string? ErrorCode { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ImagePath { get; set; }

        public DateTime CreatedDate { get; set; }

        public string UserId { get; set; } = string.Empty;
    }
}