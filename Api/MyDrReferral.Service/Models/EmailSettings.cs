namespace MyDrReferral.Service.Models
{
    public class EmailSettings
    {
        public EmailSettings()
        {
            this.EnableSsl = false;
            this.IsBodyHtml = true;
        }
        public string SendMailFrom { get; set; }
        public string SMTPPort { get; set; }
        public string SMTPHost { get; set; }
        public string SMTPPassword { get; set; }
        public string SMTPUserName { get; set; }
        public bool EnableSsl { get; set; }
        public bool IsBodyHtml { get; set; }
    }
}
