namespace MyDrReferral.Service.Interface
{
    public interface IEmailService
    {
         Task<bool> SendMail(List<string> to, List<string> cc, string body, string subject, List<string> attachments, int EmailFromType);
    }
}
