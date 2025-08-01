namespace MyDrReferral.Service.Models
{
    public  class BulkUserData
    {
        public int UserId { get; set; }
        public string Email { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string Password { get; set; } = "";
        public int UserType { get; set; }
        

        public string? FirmName { get; set; }

        public string? Address1 { get; set; }

        public string? Address2 { get; set; }

        public string? District { get; set; }

        public string? City { get; set; }

        public string? PostalCode { get; set; }

        public string? State { get; set; }

        public DateTime? EstablishedOn { get; set; }

        public decimal? Lat { get; set; }

        public decimal? Long { get; set; }
        public bool isHome { get; set; } = false;


        public DateTime? BirthDate { get; set; }

        public DateTime? Anniversary { get; set; }

        public string? Degrees { get; set; }

        public string? Services { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDelete { get; set; } = false;

    }
}
