using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ErrorRequest:IRequest<bool>
    {
        //Parameters that we pass from controller
        public ErrorLogModel ErrorLogModel { get; set; }
    }
}
