namespace Ariza.Api.Bootstrap
{
    public class SeedUserOptions
    {
        public const string SectionName = "SeedUsers";

        public List<SeedUserEntry> Users { get; set; } = new();
    }

    public class SeedUserEntry
    {
        public string UserName { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string BandNumber { get; set; } = string.Empty;

        public string Role { get; set; } = "User";
    }
}
