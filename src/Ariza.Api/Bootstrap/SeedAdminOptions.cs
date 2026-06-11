namespace Ariza.Api.Bootstrap
{
    public class SeedAdminOptions
    {
        public const string SectionName = "SeedAdmin";

        public string UserName { get; set; } = "admin";

        public string Password { get; set; } = string.Empty;

        public string BandNumber { get; set; } = "ADMIN";
    }
}
