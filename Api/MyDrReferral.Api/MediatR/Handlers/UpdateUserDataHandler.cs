using MediatR;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class UpdateUserDataHandler : IRequestHandler<UpdateUserDataRequest,ServiceResponse>
    {
        private readonly IUserService _userService;

        public UpdateUserDataHandler(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<ServiceResponse> Handle(UpdateUserDataRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _userService.UpdateUser(request.UpdateUserData);
        }
    }
}
