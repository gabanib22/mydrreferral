using MediatR;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ResetPasswordHandler:IRequestHandler<ResetPasswordRequest,ServiceResponse>
    {
        private readonly IUserService _userService;
        public ResetPasswordHandler(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<ServiceResponse> Handle(ResetPasswordRequest request, CancellationToken cancellationToken = default)
        {
            return await _userService.ResetPassword(request.ResetPassword);
        }
    }
}
