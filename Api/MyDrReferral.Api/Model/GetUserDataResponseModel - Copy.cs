namespace MyDrReferral.Api.Model
{
    public class GetUserDataResponseModel
    {
        public int UserId { get; set; }
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

        public string? PhotoUrl { get; set; }
    }
}
