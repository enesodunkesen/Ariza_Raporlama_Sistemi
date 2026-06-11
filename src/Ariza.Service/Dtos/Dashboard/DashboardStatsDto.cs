namespace Ariza.Service.Dtos.Dashboard
{
    public class DashboardStatsDto
    {
        public int TodayCount { get; set; }

        public int WeeklyCount { get; set; }

        public int TotalCount { get; set; }

        public int PendingCount { get; set; }

        public int InProgressCount { get; set; }

        public int CompletedCount { get; set; }
    }
}
