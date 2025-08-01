using MediatR;
using Microsoft.AspNetCore.Identity;
using MyDrReferral.Data.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class RegistrationRequest : IRequest<IdentityResult>
    {
        //Parameters that we pass from controller
        public ApplicationUser User { get; set; }
        public string Password { get; set; }
    }
}
