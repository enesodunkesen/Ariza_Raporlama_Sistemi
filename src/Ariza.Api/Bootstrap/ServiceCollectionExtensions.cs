using Microsoft.Extensions.DependencyInjection;

namespace Ariza.Api.Bootstrap
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApiBootstrap(this IServiceCollection services)
        {
            services.AddScoped<IdentitySeeder>();
            return services;
        }
    }
}
