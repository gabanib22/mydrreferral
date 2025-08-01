using MediatR;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ConnectionRequestHandler:IRequestHandler<ConnectionRequest,ServiceResponse>
    {
        private readonly IConnectionService _connectionService;
        public ConnectionRequestHandler(IConnectionService connectionService)
        {
            _connectionService = connectionService;
        }

        public async Task<ServiceResponse> Handle(
       ConnectionRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _connectionService.ConnectionRequest(request.Connection);
        }
    }
}
