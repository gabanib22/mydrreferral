namespace MyDrReferral.Service.Models
{
    public class ServiceResponse
    {
        public ServiceResponse()
        {
            Message = new List<string>();
        }
        public bool IsSuccess { get; set; }        
        public List<string> Message { get; set; }

    }
}
