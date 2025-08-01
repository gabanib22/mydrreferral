using System.ComponentModel.DataAnnotations;

namespace MyDrReferral.Api.Model
{
    public class UserRegistrationRequest
    {
        //public string? Id { get; set; } 
        //public string? UserName { get; set; }
        [Required]
        public string Password { get; set; } = "";
        [Required]
        public string? FirstName { get; set; }
        [Required]
        public string? LastName { get; set; }
        [Required]
        public string? PhoneNumber { get; set; }
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
        [Required]
        public int UserType { get; set; }
    }
}
