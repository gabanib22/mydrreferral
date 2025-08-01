using Newtonsoft.Json;

namespace MyDrReferral.Service.Models
{
    public class ErrorLogModel
    {
        public int Id { get; set; }
        public string? Subject { get; set; }
        public string? Description { get; set; }
        public string? Response { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }

        public ErrorLogModel(Exception ex)
        {
            Description = ex.Message.ToString();
            Response = JsonConvert.SerializeObject(ex);
        }
    }
}
