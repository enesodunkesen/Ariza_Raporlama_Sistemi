using Ariza.Core.Entities;
using Ariza.Service.Configurations;
using Ariza.Service.Dtos.Auth;
using Ariza.Service.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Ariza.Service.Implementations
{
    public class JwtTokenService : ITokenService
    {
        private readonly JwtOptions _options;

        public JwtTokenService(IOptions<JwtOptions> options)
        {
            _options = options.Value;
        }

        public Task<AuthResponseDto> CreateTokenAsync(AppUser user, IList<string> roles)
        {
            var role = roles.FirstOrDefault() ?? string.Empty;
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Role, role),
                new Claim("BandNumber", user.BandNumber ?? string.Empty)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddMinutes(_options.ExpirationInMinutes);

            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                expires: expiration,
                signingCredentials: credentials);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Task.FromResult(new AuthResponseDto
            {
                Token = tokenString,
                Expiration = expiration,
                UserId = user.Id,
                UserName = user.UserName ?? string.Empty,
                Role = role
            });
        }
    }
}
