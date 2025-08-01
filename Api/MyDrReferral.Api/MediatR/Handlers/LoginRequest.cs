using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class LoginRequest:IRequest<string>
    {
        public LoginModel LoginModel { get; set;}
    }
}
