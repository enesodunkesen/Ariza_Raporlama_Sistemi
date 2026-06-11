using Ariza.Core.Entities;
using Ariza.Service.Dtos.Auth;

namespace Ariza.Service.Interfaces
{
    public interface ITokenService
    {
        Task<AuthResponseDto> CreateTokenAsync(AppUser user, IList<string> roles);
    }
}
