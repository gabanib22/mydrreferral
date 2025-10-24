using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MyDrReferral.Api.Model
{
    public class RefferModel
    {
        public int Id { get; set; }
        [Required]
        [JsonPropertyName("connection_id")]
        public int ConnectionId { get; set; }
        [Required]
        [JsonPropertyName("patient_name")]
        public string? PatientName{ get; set; }
        //public int PatientId { get; set; }
        [JsonPropertyName("notes")]
        public string? Notes { get; set; }
        [JsonPropertyName("rfl_amount")]
        public int RflAmount { get; set; }
        public DateTime? RrlfDate { get; set; }
        public DateTime? AcceptedDate { get; set; }
        public bool IsAccepted { get; set; }
        public bool IsDeleted { get; set; }
        [Required]
        [JsonPropertyName("status")]
        public int Status { get; set; }
    }
}
