namespace MyDrReferral.Api.Model
{
    public class UserProfileResponseModel
    {
        public string Id { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public int UserType { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedOn { get; set; }
        public decimal? ReferralAmount { get; set; }
        public string? Specialization { get; set; }
        public string? Experience { get; set; }
        public string? Qualification { get; set; }
        public string? ClinicName { get; set; }
        public string? ClinicAddress { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Pincode { get; set; }
        public string? Bio { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? PhotoUrl { get; set; }
    }
}
