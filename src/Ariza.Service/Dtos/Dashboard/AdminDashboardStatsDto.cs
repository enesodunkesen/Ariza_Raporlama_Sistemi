namespace Ariza.Service.Dtos.Dashboard
{
    public class AdminDashboardStatsDto
    {
        public int TotalReports { get; set; }

        public int PendingCount { get; set; }

        public int InProgressCount { get; set; }

        public int ResolvedCount { get; set; }

        public int TodayCount { get; set; }

        public int TotalMaintenanceRequests { get; set; }
    }
}
