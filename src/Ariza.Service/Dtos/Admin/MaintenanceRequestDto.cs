namespace Ariza.Service.Dtos.Admin
{
    public class MaintenanceRequestDto
    {
        public int Id { get; set; }

        public int ReportId { get; set; }

        public string RequestText { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public string CreatedById { get; set; } = string.Empty;
    }
}