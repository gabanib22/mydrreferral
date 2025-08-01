using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ChangePasswordRequest:IRequest<ServiceResponse>
    {
        public ChangePassword ChangePassword { get; set; }
    }
}
