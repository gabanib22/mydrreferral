using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ResetPasswordRequest:IRequest<ServiceResponse>
    {
        public ResetPassword ResetPassword { get; set; }
    }
}
