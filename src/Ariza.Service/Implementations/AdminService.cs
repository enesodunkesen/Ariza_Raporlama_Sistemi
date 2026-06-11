using Ariza.Core.Entities;
using Ariza.Core.Interfaces;
using Ariza.Service.Common;
using Ariza.Service.Dtos.Admin;
using Ariza.Service.Dtos.Dashboard;
using Ariza.Service.Dtos.Reports;
using Ariza.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace Ariza.Service.Implementations
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;

        public AdminService(
            IUnitOfWork unitOfWork,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<ServiceResult<IEnumerable<FaultReportDto>>> GetAllReportsAsync(string? status)
        {
            var query = _unitOfWork.Repository<FaultReport>().Query();

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!Enum.TryParse<FaultStatus>(status, true, out var parsedStatus))
                {
                    return ServiceResult<IEnumerable<FaultReportDto>>.Failure("Geçersiz durum filtresi. Geçerli değerler: Pending, InProgress, Resolved");
                }

                query = query.Where(x => x.Status == parsedStatus);
            }

            var reports = await query
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            return ServiceResult<IEnumerable<FaultReportDto>>.Success(reports.Select(MapReport).ToList());
        }

        public async Task<ServiceResult> UpdateReportStatusAsync(int reportId, string status)
        {
            if (!Enum.TryParse<FaultStatus>(status, true, out var parsedStatus))
            {
                return ServiceResult.Failure("Geçersiz arıza durumu.");
            }

            var repo = _unitOfWork.Repository<FaultReport>();
            var report = await repo.Query().FirstOrDefaultAsync(x => x.Id == reportId);
            if (report is null)
            {
                return ServiceResult.Failure("Arıza kaydı bulunamadı.");
            }

            report.Status = parsedStatus;
            repo.Update(report);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult.Success("Arıza durumu güncellendi.");
        }

        public async Task<ServiceResult<MaintenanceRequestDto>> CreateRequestAsync(string createdById, CreateMaintenanceRequestDto request)
        {
            var report = await _unitOfWork.Repository<FaultReport>().Query().FirstOrDefaultAsync(x => x.Id == request.ReportId);
            if (report is null)
            {
                return ServiceResult<MaintenanceRequestDto>.Failure("İlgili arıza kaydı bulunamadı.");
            }

            var maintenanceRequest = new MaintenanceRequest
            {
                ReportId = request.ReportId,
                RequestText = request.RequestText,
                CreatedById = createdById,
                Status = MaintenanceStatus.Pending,
                CreatedDate = DateTime.UtcNow
            };

            await _unitOfWork.Repository<MaintenanceRequest>().AddAsync(maintenanceRequest);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<MaintenanceRequestDto>.Success(MapRequest(maintenanceRequest));
        }

        public async Task<ServiceResult<IEnumerable<MaintenanceRequestDto>>> GetMyRequestsAsync(string createdById)
        {
            var requests = await _unitOfWork.Repository<MaintenanceRequest>()
                .Query()
                .Include(x => x.CreatedBy)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            return ServiceResult<IEnumerable<MaintenanceRequestDto>>.Success(requests.Select(MapRequest).ToList());
        }

        public async Task<ServiceResult<AdminDashboardStatsDto>> GetDashboardStatsAsync()
        {
            var reportQuery = _unitOfWork.Repository<FaultReport>().Query();
            var today = DateTime.UtcNow.Date;

            var stats = new AdminDashboardStatsDto
            {
                TotalReports = await reportQuery.CountAsync(),
                PendingCount = await reportQuery.CountAsync(x => x.Status == FaultStatus.Pending),
                InProgressCount = await reportQuery.CountAsync(x => x.Status == FaultStatus.InProgress),
                ResolvedCount = await reportQuery.CountAsync(x => x.Status == FaultStatus.Resolved),
                TodayCount = await reportQuery.CountAsync(x => x.CreatedDate >= today),
                TotalMaintenanceRequests = await _unitOfWork.Repository<MaintenanceRequest>().Query().CountAsync()
            };

            return ServiceResult<AdminDashboardStatsDto>.Success(stats);
        }

        public async Task<ServiceResult<IEnumerable<FaultByBandDto>>> GetFaultsByBandAsync(string? status)
        {
            var query = _unitOfWork.Repository<FaultReport>().Query();

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!Enum.TryParse<FaultStatus>(status, true, out var parsedStatus))
                {
                    return ServiceResult<IEnumerable<FaultByBandDto>>.Failure("Geçersiz durum filtresi. Geçerli değerler: Pending, InProgress, Resolved");
                }

                query = query.Where(x => x.Status == parsedStatus);
            }

            var data = await query
                .GroupBy(x => x.BandNumber ?? "Bilinmeyen")
                .Select(g => new FaultByBandDto
                {
                    BandNumber = g.Key,
                    FaultCount = g.Count()
                })
                .OrderBy(x => x.BandNumber)
                .ToListAsync();

            return ServiceResult<IEnumerable<FaultByBandDto>>.Success(data);
        }

        public async Task<ServiceResult<IEnumerable<MonthlyTrendDto>>> GetMonthlyTrendAsync(int months)
        {
            if (months < 1) months = 8;
            if (months > 24) months = 24;

            var startDate = DateTime.UtcNow.Date.AddMonths(-months + 1);
            startDate = new DateTime(startDate.Year, startDate.Month, 1); // Ayın ilk günü

            var reports = await _unitOfWork.Repository<FaultReport>()
                .Query()
                .Where(x => x.CreatedDate >= startDate)
                .Select(x => new { x.CreatedDate, x.Status })
                .ToListAsync();

            var turkishMonths = new[] { "", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara" };

            var result = new List<MonthlyTrendDto>();

            for (int i = 0; i < months; i++)
            {
                var current = DateTime.UtcNow.Date.AddMonths(-months + 1 + i);
                var year = current.Year;
                var month = current.Month;

                var monthReports = reports
                    .Where(r => r.CreatedDate.Year == year && r.CreatedDate.Month == month)
                    .ToList();

                result.Add(new MonthlyTrendDto
                {
                    Month = $"{turkishMonths[month]} {(year % 100):D2}",
                    TotalCount = monthReports.Count,
                    ResolvedCount = monthReports.Count(r => r.Status == FaultStatus.Resolved)
                });
            }

            return ServiceResult<IEnumerable<MonthlyTrendDto>>.Success(result);
        }

        public async Task<ServiceResult<IEnumerable<ResolutionRateDto>>> GetResolutionRatesAsync()
        {
            var reports = await _unitOfWork.Repository<FaultReport>()
                .Query()
                .Select(x => x.Status)
                .ToListAsync();

            var total = reports.Count;
            if (total == 0)
            {
                return ServiceResult<IEnumerable<ResolutionRateDto>>.Success(new List<ResolutionRateDto>
                {
                    new ResolutionRateDto { Name = "Tamamlandı", Value = 0, Color = "#3fb950" },
                    new ResolutionRateDto { Name = "İşleme Alındı", Value = 0, Color = "#1f6feb" },
                    new ResolutionRateDto { Name = "Beklemede", Value = 0, Color = "#d29922" }
                });
            }

            var resolvedCount = reports.Count(x => x == FaultStatus.Resolved);
            var inProgressCount = reports.Count(x => x == FaultStatus.InProgress);
            var pendingCount = reports.Count(x => x == FaultStatus.Pending);

            var resolvedPercent = (int)Math.Round((double)resolvedCount * 100 / total);
            var inProgressPercent = (int)Math.Round((double)inProgressCount * 100 / total);
            var pendingPercent = 100 - resolvedPercent - inProgressPercent;
            if (pendingPercent < 0) pendingPercent = 0;

            var data = new List<ResolutionRateDto>
            {
                new ResolutionRateDto { Name = "Tamamlandı", Value = resolvedPercent, Color = "#3fb950" },
                new ResolutionRateDto { Name = "İşleme Alındı", Value = inProgressPercent, Color = "#1f6feb" },
                new ResolutionRateDto { Name = "Beklemede", Value = pendingPercent, Color = "#d29922" }
            };

            return ServiceResult<IEnumerable<ResolutionRateDto>>.Success(data);
        }

        public async Task<ServiceResult<IEnumerable<AdminUserDto>>> GetUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<AdminUserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "User";
                string frontEndRole;
                switch (role)
                {
                    case "Admin": frontEndRole = "Admin"; break;
                    case "Chief": frontEndRole = "Şef"; break;
                    default: frontEndRole = "İşçi"; break;
                }

                result.Add(new AdminUserDto
                {
                    Id = user.Id,
                    UserName = user.UserName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    BandNumber = user.BandNumber,
                    Role = frontEndRole
                });
            }

            return ServiceResult<IEnumerable<AdminUserDto>>.Success(result);
        }

        public async Task<ServiceResult> CreateUserAsync(CreateUserRequestDto request)
        {
            var exists = await _userManager.FindByNameAsync(request.UserName);
            if (exists is not null)
            {
                return ServiceResult.Failure("Kullanıcı adı zaten kullanılıyor.");
            }

            var user = new AppUser
            {
                UserName = request.UserName,
                Email = request.Email,
                BandNumber = request.BandNumber
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return ServiceResult.Failure(string.Join(" ", result.Errors.Select(e => e.Description)));
            }

            var roleToAssign = request.Role switch
            {
                "Admin" => "Admin",
                "Chief" => "Chief",
                _ => "User"
            };

            if (!await _roleManager.RoleExistsAsync(roleToAssign))
            {
                await _roleManager.CreateAsync(new AppRole { Name = roleToAssign });
            }

            await _userManager.AddToRoleAsync(user, roleToAssign);

            return ServiceResult.Success("Kullanıcı başarıyla oluşturuldu.");
        }

        public async Task<ServiceResult> UpdateUserAsync(string id, UpdateUserRequestDto request)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user is null)
            {
                return ServiceResult.Failure("Kullanıcı bulunamadı.");
            }

            user.BandNumber = request.BandNumber;
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                return ServiceResult.Failure("Kullanıcı güncellenemedi.");
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            var targetRole = request.Role switch
            {
                "Admin" => "Admin",
                "Chief" => "Chief",
                _ => "User"
            };

            if (!currentRoles.Contains(targetRole))
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!await _roleManager.RoleExistsAsync(targetRole))
                {
                    await _roleManager.CreateAsync(new AppRole { Name = targetRole });
                }
                await _userManager.AddToRoleAsync(user, targetRole);
            }

            return ServiceResult.Success("Kullanıcı başarıyla güncellendi.");
        }

        public async Task<ServiceResult> DeleteUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user is null)
            {
                return ServiceResult.Failure("Kullanıcı bulunamadı.");
            }

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded ? ServiceResult.Success("Kullanıcı silindi.") : ServiceResult.Failure("Kullanıcı silinemedi.");
        }

        public async Task<ServiceResult> DeleteReportAsync(int id)
        {
            var repo = _unitOfWork.Repository<FaultReport>();
            var report = await repo.Query()
                .Include(x => x.MaintenanceRequests)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (report is null)
            {
                return ServiceResult.Failure("Arıza kaydı bulunamadı.");
            }

            if (report.MaintenanceRequests != null && report.MaintenanceRequests.Any())
            {
                var requestRepo = _unitOfWork.Repository<MaintenanceRequest>();
                foreach (var req in report.MaintenanceRequests.ToList())
                {
                    requestRepo.Remove(req);
                }
            }

            repo.Remove(report);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult.Success("Arıza kaydı başarıyla silindi.");
        }

        private static FaultReportDto MapReport(FaultReport report)
        {
            return new FaultReportDto
            {
                Id = report.Id,
                Description = report.Description,
                BandNumber = report.BandNumber,
                ProductCode = report.ProductCode,
                ErrorCode = report.ErrorCode,
                Status = report.Status.ToString(),
                ImagePath = report.ImagePath,
                CreatedDate = report.CreatedDate,
                UserId = report.UserId
            };
        }

        public async Task<ServiceResult> UpdateMaintenanceRequestStatusAsync(int requestId, string status)
        {
            if (!Enum.TryParse<MaintenanceStatus>(status, true, out var parsedStatus))
            {
                return ServiceResult.Failure("Geçersiz talep durumu.");
            }

            var repo = _unitOfWork.Repository<MaintenanceRequest>();
            var request = await repo.Query().FirstOrDefaultAsync(x => x.Id == requestId);
            if (request is null)
            {
                return ServiceResult.Failure("Bakım talebi bulunamadı.");
            }

            request.Status = parsedStatus;
            repo.Update(request);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult.Success("Bakım talebi durumu güncellendi.");
        }

        private static MaintenanceRequestDto MapRequest(MaintenanceRequest request)
        {
            return new MaintenanceRequestDto
            {
                Id = request.Id,
                ReportId = request.ReportId,
                RequestText = request.RequestText,
                Status = request.Status.ToString(),
                CreatedDate = request.CreatedDate,
                CreatedById = request.CreatedBy?.UserName ?? request.CreatedById
            };
        }
    }
}
