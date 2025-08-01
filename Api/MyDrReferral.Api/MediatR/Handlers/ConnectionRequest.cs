using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ConnectionRequest:IRequest<ServiceResponse>
    {
        public Connection Connection { get; set; }
    }
}
