using Ariza.Service.Common;
using Ariza.Service.Dtos.Auth;

namespace Ariza.Service.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResult> RegisterAsync(RegisterRequestDto request);
        Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginRequestDto request);
    }
}