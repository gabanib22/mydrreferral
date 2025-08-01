using System.ComponentModel.DataAnnotations;

namespace MyDrReferral.Api.Model
{
    public class BulkUserDataRequestModel
    {

        public int UserId { get; set; }
        [Required]
        [EmailAddress]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; } 
        [Required]        
        public string FirstName { get; set; } 
        [Required]
        public string LastName { get; set; } = "";
        [Required]
        public string PhoneNumber { get; set; } = "";
        public string Password { get; set; } = "";
        [Required]
        public int UserType { get; set; }

        [Required]
        public string FirmName { get; set; }

        public string? Address1 { get; set; }

        public string? Address2 { get; set; }

        public string? District { get; set; }

        public string? City { get; set; }

        public string? PostalCode { get; set; }

        public string? State { get; set; }

        public DateTime? EstablishedOn { get; set; }

        public decimal? Lat { get; set; }

        public decimal? Long { get; set; }


        public DateTime? BirthDate { get; set; }

        public DateTime? Anniversary { get; set; }

        public string? Degrees { get; set; }

        public string? Services { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDelete { get; set; } = false;
    }
}
