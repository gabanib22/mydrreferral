using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class BulkUserDataRequest:IRequest<ServiceResponse>
    {
        public List<BulkUserData> BulkUserData { get; set; }
    }
}
