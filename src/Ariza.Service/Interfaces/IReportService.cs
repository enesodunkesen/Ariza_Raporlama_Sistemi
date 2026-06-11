using Ariza.Service.Common;
using Ariza.Service.Dtos.Dashboard;
using Ariza.Service.Dtos.Reports;

namespace Ariza.Service.Interfaces
{
    public interface IReportService
    {
        Task<ServiceResult<FaultReportDto>> CreateAsync(string userId, string? bandNumber, CreateFaultReportRequestDto request);
        Task<ServiceResult<IEnumerable<FaultReportDto>>> GetMyReportsAsync(string userId, string? status);
        Task<ServiceResult<DashboardStatsDto>> GetDashboardStatsAsync(string userId);
    }
}