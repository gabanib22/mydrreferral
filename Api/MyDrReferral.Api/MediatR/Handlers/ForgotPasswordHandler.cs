using MediatR;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ForgotPasswordHandler:IRequestHandler<ForgotPasswordRequest,ServiceResponse>
    {
        private readonly IUserService _userService;
        public ForgotPasswordHandler(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<ServiceResponse> Handle(
       ForgotPasswordRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _userService.ForgotPassword(request.ForgotPassword,request.CallbackUrl);
        }
    }
}
