using Ariza.Service.Dtos.Admin;
using Ariza.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ariza.Api.Controllers
{
    [ApiController]
    [Authorize(Roles = "Admin,Chief")]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetReports([FromQuery] string? status)
        {
            var result = await _adminService.GetAllReportsAsync(status);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPut("reports/{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateReportStatusRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { isSuccess = false, message = "Geçersiz istek.", errors = ModelState });
            }

            var result = await _adminService.UpdateReportStatusAsync(id, request.Status);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("requests")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateMaintenanceRequestDto request)
        {
            var createdById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _adminService.CreateRequestAsync(createdById, request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetRequests()
        {
            var createdById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _adminService.GetMyRequestsAsync(createdById);
            return Ok(result);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var result = await _adminService.GetDashboardStatsAsync();
            return Ok(result);
        }

        [HttpGet("stats/faults-by-band")]
        public async Task<IActionResult> GetFaultsByBand([FromQuery] string? status)
        {
            var result = await _adminService.GetFaultsByBandAsync(status);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("stats/monthly-trend")]
        public async Task<IActionResult> GetMonthlyTrend([FromQuery] int months = 8)
        {
            var result = await _adminService.GetMonthlyTrendAsync(months);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("stats/resolution-rate")]
        public async Task<IActionResult> GetResolutionRates()
        {
            var result = await _adminService.GetResolutionRatesAsync();
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _adminService.GetUsersAsync();
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { isSuccess = false, message = "Geçersiz istek.", errors = ModelState });
            }
            var result = await _adminService.CreateUserAsync(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { isSuccess = false, message = "Geçersiz istek.", errors = ModelState });
            }
            var result = await _adminService.UpdateUserAsync(id, request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _adminService.DeleteUserAsync(id);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("reports/{id:int}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var result = await _adminService.DeleteReportAsync(id);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPut("requests/{id:int}/status")]
        public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateMaintenanceRequestStatusDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { isSuccess = false, message = "Geçersiz istek.", errors = ModelState });
            }

            var result = await _adminService.UpdateMaintenanceRequestStatusAsync(id, request.Status);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}
