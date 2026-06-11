using System.ComponentModel.DataAnnotations;

namespace Ariza.Service.Dtos.Auth
{
    public class LoginRequestDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Platform bilgisi: "mobile" veya "web". Varsayılan: "web"
        /// </summary>
        public string Platform { get; set; } = "web";
    }
}