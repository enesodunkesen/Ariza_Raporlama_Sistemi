using Ariza.Core.Entities;
using Ariza.Service.Common;
using Ariza.Service.Dtos.Auth;
using Ariza.Service.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Ariza.Service.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly ITokenService _tokenService;

        public AuthService(
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            ITokenService tokenService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenService = tokenService;
        }

        public async Task<ServiceResult> RegisterAsync(RegisterRequestDto request)
        {
            var exists = await _userManager.FindByNameAsync(request.UserName);
            if (exists is not null)
            {
                return ServiceResult.Failure("Kullanıcı adı zaten kullanılıyor.");
            }

            var user = new AppUser
            {
                UserName = request.UserName,
                BandNumber = request.BandNumber
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return ServiceResult.Failure(string.Join(" ", result.Errors.Select(e => e.Description)));
            }

            if (!await _roleManager.RoleExistsAsync("User"))
            {
                await _roleManager.CreateAsync(new AppRole { Name = "User" });
            }

            await _userManager.AddToRoleAsync(user, "User");

            return ServiceResult.Success("Kullanıcı başarıyla oluşturuldu.");
        }

        public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginRequestDto request)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user is null)
            {
                return ServiceResult<AuthResponseDto>.Failure("Kullanıcı adı veya şifre hatalı.");
            }

            var passwordOk = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordOk)
            {
                return ServiceResult<AuthResponseDto>.Failure("Kullanıcı adı veya şifre hatalı.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var primaryRole = roles.FirstOrDefault() ?? string.Empty;

            // Platform bazlı yetkilendirme kontrolü
            var platform = request.Platform?.ToLowerInvariant() ?? "web";

            if (platform == "mobile")
            {
                // Mobil uygulamaya sadece User ve Chief rolleri giriş yapabilir
                if (primaryRole == "Admin")
                {
                    return ServiceResult<AuthResponseDto>.Failure("Admin hesabı ile mobil uygulamaya giriş yapılamaz.");
                }
            }
            else
            {
                // Web paneline sadece Admin rolü giriş yapabilir
                if (primaryRole != "Admin")
                {
                    return ServiceResult<AuthResponseDto>.Failure("Bu panele yalnızca yönetici (Admin) hesaplarıyla giriş yapılabilir.");
                }
            }

            var token = await _tokenService.CreateTokenAsync(user, roles);
            return ServiceResult<AuthResponseDto>.Success(token);
        }
    }
}
