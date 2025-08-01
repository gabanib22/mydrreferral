using System.ComponentModel.DataAnnotations;

namespace MyDrReferral.Api.Model
{
    public class UpdateRefferStatusModel
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public int Status { get; set; }
    }
}
