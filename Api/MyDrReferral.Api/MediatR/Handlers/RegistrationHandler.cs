using MediatR;
using Microsoft.AspNetCore.Identity;
using MyDrReferral.Service.Interface;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class RegistrationHandler:IRequestHandler<RegistrationRequest,IdentityResult>
    {
        private readonly IUserService _userService;                
        public RegistrationHandler(IUserService userService)
        {
            _userService = userService;                    
        }

        public async Task<IdentityResult> Handle(
       RegistrationRequest request,
       CancellationToken cancellationToken = default)
        {
           return await _userService.AddEditUser(request.User,request.Password);
        }
    }
}
