using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class SingleUserDataRequest:IRequest<ServiceResponse>
    {
        public SingleUserData? SingleUserData { get; set;}
    }
}
