using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ForgotPasswordRequest:IRequest<ServiceResponse>
    {
        public ForgotPassword ForgotPassword { get; set; }
        public string CallbackUrl { get; set; } = string.Empty;
    }
}
