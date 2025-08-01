using MediatR;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class FilterDoctorDataHandler:IRequestHandler<FilterDoctorDataRequest,List<SearchDDLResponse>>
    {
        private readonly IUserService _userService;

        public FilterDoctorDataHandler(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<List<SearchDDLResponse>> Handle(FilterDoctorDataRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _userService.FilterDoctorDataByText(request.SearchText);
        }
    }
}
