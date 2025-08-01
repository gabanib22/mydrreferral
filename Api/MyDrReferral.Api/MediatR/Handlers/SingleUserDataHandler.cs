using MediatR;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class SingleUserDataHandler : IRequestHandler<SingleUserDataRequest,ServiceResponse>
    {
        private readonly IUserService _userService;

        public SingleUserDataHandler(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<ServiceResponse> Handle(SingleUserDataRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _userService.AddSingleUser(request.SingleUserData);
        }
    }
}
