using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MyDrReferral.Api.Model
{
    public class UpdateReferralStatusRequest
    {
        [Required]
        [JsonPropertyName("referral_id")]
        public string ReferralId { get; set; } = string.Empty;
        
        [Required]
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;
    }
}
