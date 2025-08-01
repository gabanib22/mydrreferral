using MediatR;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class FilterDoctorDataRequest:IRequest<List<SearchDDLResponse>>
    {
        public string SearchText { get; set; }
    }
}
