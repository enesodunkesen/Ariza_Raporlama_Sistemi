namespace Ariza.Service.Dtos.Dashboard
{
    public class MonthlyTrendDto
    {
        public string Month { get; set; } = string.Empty;

        public int TotalCount { get; set; }

        public int ResolvedCount { get; set; }
    }
}
