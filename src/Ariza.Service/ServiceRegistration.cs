using Ariza.Service.Configurations;
using Ariza.Service.Implementations;
using Ariza.Service.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ariza.Service
{
    public static class ServiceRegistration
    {
        public static IServiceCollection AddBusinessServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
            services.AddScoped<ITokenService, JwtTokenService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<IAdminService, AdminService>();
            return services;
        }
    }
}