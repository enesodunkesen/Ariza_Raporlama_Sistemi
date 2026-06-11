using Ariza.Core.Entities;
using Ariza.Core.Interfaces;
using Ariza.Service.Common;
using Ariza.Service.Dtos.Dashboard;
using Ariza.Service.Dtos.Reports;
using Ariza.Service.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace Ariza.Service.Implementations
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _environment;

        public ReportService(IUnitOfWork unitOfWork, IWebHostEnvironment environment)
        {
            _unitOfWork = unitOfWork;
            _environment = environment;
        }

        public async Task<ServiceResult<FaultReportDto>> CreateAsync(string userId, string? bandNumber, CreateFaultReportRequestDto request)
        {
            var imagePath = await SaveImageAsync(request.Image);
            var report = new FaultReport
            {
                UserId = userId,
                BandNumber = bandNumber,
                Description = request.Description,
                ProductCode = request.ProductCode,
                ErrorCode = request.ErrorCode,
                ImagePath = imagePath,
                Status = FaultStatus.Pending,
                CreatedDate = DateTime.UtcNow
            };

            await _unitOfWork.Repository<FaultReport>().AddAsync(report);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<FaultReportDto>.Success(MapToDto(report));
        }

        public async Task<ServiceResult<IEnumerable<FaultReportDto>>> GetMyReportsAsync(string userId, string? status)
        {
            var query = _unitOfWork.Repository<FaultReport>()
                .Query()
                .Where(x => x.UserId == userId);

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

            return ServiceResult<IEnumerable<FaultReportDto>>.Success(reports.Select(MapToDto).ToList());
        }

        public async Task<ServiceResult<DashboardStatsDto>> GetDashboardStatsAsync(string userId)
        {
            var query = _unitOfWork.Repository<FaultReport>().Query()
                .Where(x => x.UserId == userId);

            var today = DateTime.UtcNow.Date;
            var weekStart = today.AddDays(-(int)today.DayOfWeek);

            var stats = new DashboardStatsDto
            {
                TodayCount = await query.CountAsync(x => x.CreatedDate >= today),
                WeeklyCount = await query.CountAsync(x => x.CreatedDate >= weekStart),
                TotalCount = await query.CountAsync(),
                PendingCount = await query.CountAsync(x => x.Status == FaultStatus.Pending),
                InProgressCount = await query.CountAsync(x => x.Status == FaultStatus.InProgress),
                CompletedCount = await query.CountAsync(x => x.Status == FaultStatus.Resolved)
            };

            return ServiceResult<DashboardStatsDto>.Success(stats);
        }

        private static FaultReportDto MapToDto(FaultReport report)
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

        private async Task<string?> SaveImageAsync(Microsoft.AspNetCore.Http.IFormFile? image)
        {
            if (image is null || image.Length == 0)
            {
                return null;
            }

            // File size control: max 5MB
            const long maxFileSizeBytes = 5 * 1024 * 1024;
            if (image.Length > maxFileSizeBytes)
            {
                throw new InvalidOperationException("Dosya boyutu 5MB'ı aşamaz.");
            }

            // File type control
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new InvalidOperationException("Desteklenen dosya türleri: jpg, jpeg, png, gif, webp");
            }

            // Content-Type validation
            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedContentTypes.Contains(image.ContentType?.ToLowerInvariant() ?? ""))
            {
                throw new InvalidOperationException("Geçersiz dosya türü.");
            }

            var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var uploadFolder = Path.Combine(webRootPath, "uploads", "reports");
            Directory.CreateDirectory(uploadFolder);

            var fileName = $"{Guid.NewGuid():N}{fileExtension}";
            var physicalPath = Path.Combine(uploadFolder, fileName);

            await using var stream = new FileStream(physicalPath, FileMode.Create);
            await image.CopyToAsync(stream);

            return $"/uploads/reports/{fileName}";
        }
    }
}
