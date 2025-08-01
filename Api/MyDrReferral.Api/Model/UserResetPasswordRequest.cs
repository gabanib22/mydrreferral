using System.ComponentModel.DataAnnotations;

namespace MyDrReferral.Api.Model
{
    public class UserResetPasswordRequest
    {
        [Required]
        public string Token { get; set; }
        [Required]
        [DataType(DataType.EmailAddress)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
