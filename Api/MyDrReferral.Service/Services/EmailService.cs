using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;
using Newtonsoft.Json;
using System.Net.Mail;

namespace MyDrReferral.Service.Services
{
    public class EmailService : IEmailService
    {
        #region Ctor
        private readonly EmailSettings _emailSettings;
        //14-07-2023
        private readonly IErrorLogService _errorLogService;
        public EmailService(EmailSettings emailSettings, IErrorLogService errorLogService)
        {
            _emailSettings = emailSettings;
            _errorLogService = errorLogService;
        }
        #endregion

        #region Send Mail        
        public async Task<bool> SendMail(List<string> to, List<string> cc, string body, string subject, List<string> attachments, int EmailFromType)
        {

            using (MailMessage mailMessage = new MailMessage())
            {

                mailMessage.From = new MailAddress(_emailSettings.SendMailFrom);

                to.ForEach((x) =>
                {
                    if (Convert.ToString(x).Trim() != string.Empty)
                        mailMessage.To.Add(new MailAddress(x));
                });
                cc.ForEach((x) =>
                {
                    if (Convert.ToString(x).Trim() != string.Empty)
                        mailMessage.CC.Add(new MailAddress(x));
                });
                //try
                //{
                //    SmtpClient SmtpServer = new SmtpClient();
                //    SmtpServer.Credentials = new System.Net.NetworkCredential(_emailSettings.SMTPUserName, _emailSettings.SMTPPassword);
                //    if (!string.IsNullOrEmpty(_emailSettings.SMTPPort))
                //    {
                //        int port = 0;
                //        if (int.TryParse(_emailSettings.SMTPPort, out port))
                //            SmtpServer.Port = port;
                //    }
                //    SmtpServer.Host = _emailSettings.SMTPHost;
                //    SmtpServer.EnableSsl = _emailSettings.EnableSsl;
                //    // SmtpServer.EnableSsl = false;
                //    mailMessage.IsBodyHtml = _emailSettings.IsBodyHtml;
                //    mailMessage.Body = body;
                //    mailMessage.Subject = subject;
                //    mailMessage.ReplyToList.Add(new MailAddress(_emailSettings.SendMailFrom));
                //    if (attachments != null && attachments.Count > 0)
                //        attachments.ForEach(x => mailMessage.Attachments.Add(new Attachment(x)));
                //    SmtpServer.Send(mailMessage);
                //}
                //catch (Exception ex)
                //{                    
                //    await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                //    {                       
                //        Description = $"Data :: to : {JsonConvert.SerializeObject(to)}, cc : {JsonConvert.SerializeObject(cc)}, body : {body}, subject : {subject}, attachments : {JsonConvert.SerializeObject(attachments)}, EmailFromType : {EmailFromType} ### Exception ### {ex.Message}",
                //    });
                //    return false;
                //}

                try
                {
                    SmtpClient SmtpServer = new SmtpClient("smtp.gmail.com"); // Use Gmail's SMTP server
                    SmtpServer.Credentials = new System.Net.NetworkCredential(_emailSettings.SMTPUserName, _emailSettings.SMTPPassword);
                    SmtpServer.Port = Convert.ToInt32(_emailSettings.SMTPPort); // Use the recommended Gmail port
                    SmtpServer.EnableSsl =true; // Enable SSL for secure communication with Gmail

                    // Enable STARTTLS for secure connection
                    SmtpServer.DeliveryMethod = SmtpDeliveryMethod.Network;
                    SmtpServer.UseDefaultCredentials = false;
                    SmtpServer.EnableSsl = true;

                    mailMessage.IsBodyHtml = _emailSettings.IsBodyHtml;
                    mailMessage.Body = body;
                    mailMessage.Subject = subject;
                    mailMessage.ReplyToList.Add(new MailAddress(_emailSettings.SendMailFrom));

                    if (attachments != null && attachments.Count > 0)
                    {
                        attachments.ForEach(x => mailMessage.Attachments.Add(new Attachment(x)));
                    }

                    SmtpServer.Send(mailMessage);
                }
                catch (Exception ex)
                {
                    await _errorLogService.AddErrorLog(new ErrorLogModel(ex)
                    {
                        Subject = Common.GetErrorSubject(),
                        Description = $"Data :: to : {JsonConvert.SerializeObject(to)}, cc : {JsonConvert.SerializeObject(cc)}, body : {body}, subject : {subject}, attachments : {JsonConvert.SerializeObject(attachments)}, EmailFromType : {EmailFromType} ### Exception ### {ex.Message}",
                    });
                    return false;
                }
            }
            return true;
        }
        #endregion
    }
}
