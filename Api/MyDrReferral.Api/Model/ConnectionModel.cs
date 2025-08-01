using System.ComponentModel.DataAnnotations;
namespace MyDrReferral.Api.Model
{
    public class ConnectionModel
    {
        public int Id { get; set; }

        public int SenderId { get; set; }
        [Required]
        public int ReceiverId { get; set; }

        public bool IsAccepted { get; set; }
        public bool IsRejected { get; set; }
        public string? Notes { get; set; }
        
        public bool IsDeleted { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public DateTime? LastUpdateDate { get; set; }
    }
}
