using Microsoft.AspNetCore.Identity;

namespace Ariza.Core.Entities
{
    public class AppUser : IdentityUser
    {
        public string? BandNumber { get; set; }
    }
}
