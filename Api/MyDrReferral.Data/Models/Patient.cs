

namespace MyDrReferral.Data.Models
{
    public partial class Patient
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int RrlfById { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
    }
}
