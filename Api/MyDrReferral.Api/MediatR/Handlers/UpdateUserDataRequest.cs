using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class UpdateUserDataRequest : IRequest<ServiceResponse>
    {
        public UpdateUserData? UpdateUserData { get; set;}
    }
}
