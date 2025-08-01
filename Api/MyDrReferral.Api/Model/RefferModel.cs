using System.ComponentModel.DataAnnotations;

namespace MyDrReferral.Api.Model
{
    public class RefferModel
    {
        public int Id { get; set; }
        [Required]
        public int ConnectioionId { get; set; }
        [Required]
        public string? PatientName{ get; set; }
        //public int PatientId { get; set; }
        public string? Notes { get; set; }
        public int RflAmount { get; set; }
        public DateTime? RrlfDate { get; set; }
        public DateTime? AcceptedDate { get; set; }
        public bool IsAccepted { get; set; }
        public bool IsDeleted { get; set; }
        [Required]
        public int Status { get; set; }
    }
}
