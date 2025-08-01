namespace MyDrReferral.Api.Model
{
    public class ResponseModel
    {
        public ResponseModel()
        {
            Message = new List<string>();
        }
        public bool IsSuccess { get; set; }
        //public string Error { get; set; } = "";
        public List<string> Message { get; set; }

    }
}
