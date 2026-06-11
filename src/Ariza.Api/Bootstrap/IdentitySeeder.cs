using Ariza.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Ariza.Api.Bootstrap
{
    public class IdentitySeeder
    {
        private readonly RoleManager<AppRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;
        private readonly SeedAdminOptions _seedAdminOptions;
        private readonly SeedUserOptions _seedUserOptions;
        private readonly ILogger<IdentitySeeder> _logger;

        public IdentitySeeder(
            RoleManager<AppRole> roleManager,
            UserManager<AppUser> userManager,
            IOptions<SeedAdminOptions> seedAdminOptions,
            IOptions<SeedUserOptions> seedUserOptions,
            ILogger<IdentitySeeder> logger)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _seedAdminOptions = seedAdminOptions.Value;
            _seedUserOptions = seedUserOptions.Value;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            // Seed roles
            var roles = new[] { "User", "Admin", "Chief" };
            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new AppRole { Name = role });
                    _logger.LogInformation("Role '{Role}' created.", role);
                }
            }

            // Seed admin user
            await SeedSingleUserAsync(
                _seedAdminOptions.UserName,
                _seedAdminOptions.Password,
                _seedAdminOptions.BandNumber,
                "Admin");

            // Seed additional users
            foreach (var userEntry in _seedUserOptions.Users)
            {
                await SeedSingleUserAsync(
                    userEntry.UserName,
                    userEntry.Password,
                    userEntry.BandNumber,
                    userEntry.Role);
            }
        }

        private async Task SeedSingleUserAsync(string userName, string password, string bandNumber, string role)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return;
            }

            var existingUser = await _userManager.FindByNameAsync(userName);
            if (existingUser is null)
            {
                var newUser = new AppUser
                {
                    UserName = userName,
                    BandNumber = bandNumber
                };

                var creationResult = await _userManager.CreateAsync(newUser, password);
                if (!creationResult.Succeeded)
                {
                    var errors = string.Join(", ", creationResult.Errors.Select(e => e.Description));
                    _logger.LogWarning("Failed to create seed user '{UserName}': {Errors}", userName, errors);
                    return;
                }

                _logger.LogInformation("Seed user '{UserName}' created.", userName);
                existingUser = newUser;
            }

            if (!await _userManager.IsInRoleAsync(existingUser, role))
            {
                await _userManager.AddToRoleAsync(existingUser, role);
                _logger.LogInformation("User '{UserName}' assigned to role '{Role}'.", userName, role);
            }
        }
    }
}
