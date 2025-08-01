using System.ComponentModel.DataAnnotations;

namespace MyDrReferral.Api.Model
{
    public class ConnectionResponseModel
    {
        [Required]
        public int ConnectionId { get; set; }
        public bool IsAccepted { get; set; }
    }
}
