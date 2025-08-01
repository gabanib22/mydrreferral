using System.ComponentModel.DataAnnotations;

namespace MyDrReferral.Api.Model
{
    public class UserForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

    }
}
