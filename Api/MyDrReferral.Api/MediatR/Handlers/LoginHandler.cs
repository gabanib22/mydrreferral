using MediatR;
using MyDrReferral.Service.Interface;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class LoginHandler: IRequestHandler<LoginRequest,string>
    {
        private readonly IUserService _userService;
        public LoginHandler(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<string> Handle(
       LoginRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _userService.Login(request.LoginModel);
        }
    }
}

