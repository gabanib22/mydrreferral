using MediatR;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class BulkUserDataHandler:IRequestHandler<BulkUserDataRequest,ServiceResponse>
    {
        private readonly IUserService _userService;

        public BulkUserDataHandler(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<ServiceResponse> Handle(BulkUserDataRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _userService.AddBulkUsers(request.BulkUserData);
        }
    }
}
