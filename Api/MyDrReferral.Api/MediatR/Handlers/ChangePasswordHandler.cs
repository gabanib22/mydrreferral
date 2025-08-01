using MediatR;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ChangePasswordHandler:IRequestHandler<ChangePasswordRequest,ServiceResponse>
    {
        private readonly IUserService _userService;
        public ChangePasswordHandler(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<ServiceResponse> Handle(
       ChangePasswordRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _userService.ChangePassword(request.ChangePassword);
        }
    }
}
