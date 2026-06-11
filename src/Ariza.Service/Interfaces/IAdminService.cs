using Ariza.Service.Common;
using Ariza.Service.Dtos.Admin;
using Ariza.Service.Dtos.Dashboard;
using Ariza.Service.Dtos.Reports;

namespace Ariza.Service.Interfaces
{
    public interface IAdminService
    {
        Task<ServiceResult<IEnumerable<FaultReportDto>>> GetAllReportsAsync(string? status);
        Task<ServiceResult> UpdateReportStatusAsync(int reportId, string status);
        Task<ServiceResult<MaintenanceRequestDto>> CreateRequestAsync(string createdById, CreateMaintenanceRequestDto request);
        Task<ServiceResult<IEnumerable<MaintenanceRequestDto>>> GetMyRequestsAsync(string createdById);
        Task<ServiceResult<AdminDashboardStatsDto>> GetDashboardStatsAsync();
        Task<ServiceResult<IEnumerable<FaultByBandDto>>> GetFaultsByBandAsync(string? status);
        Task<ServiceResult<IEnumerable<MonthlyTrendDto>>> GetMonthlyTrendAsync(int months);
        Task<ServiceResult<IEnumerable<ResolutionRateDto>>> GetResolutionRatesAsync();
        Task<ServiceResult<IEnumerable<AdminUserDto>>> GetUsersAsync();
        Task<ServiceResult> CreateUserAsync(CreateUserRequestDto request);
        Task<ServiceResult> UpdateUserAsync(string id, UpdateUserRequestDto request);
        Task<ServiceResult> DeleteUserAsync(string id);
        Task<ServiceResult> DeleteReportAsync(int id);
        Task<ServiceResult> UpdateMaintenanceRequestStatusAsync(int requestId, string status);
    }
}