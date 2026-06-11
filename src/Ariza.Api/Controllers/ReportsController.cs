using Ariza.Service.Dtos.Dashboard;
using Ariza.Service.Dtos.Reports;
using Ariza.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ariza.Api.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [Authorize(Roles = "User")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateFaultReportRequestDto request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var bandNumber = User.FindFirstValue("BandNumber");
            var result = await _reportService.CreateAsync(userId, bandNumber, request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [Authorize(Roles = "User")]
        [HttpGet("my-reports")]
        public async Task<IActionResult> GetMyReports([FromQuery] string? status)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _reportService.GetMyReportsAsync(userId, status);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [Authorize(Roles = "User")]
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _reportService.GetDashboardStatsAsync(userId);
            return Ok(result);
        }
    }
}
