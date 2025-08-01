using MediatR;
using MyDrReferral.Service.Interface;

namespace MyDrReferral.Api.MediatR.Handlers
{
    public class ErrorHandler:IRequestHandler<ErrorRequest,bool>
    {
        
        private readonly IErrorLogService _errorLogService;

        public ErrorHandler(IErrorLogService errorLogService)
        {
            _errorLogService = errorLogService;
        }


        public async Task<bool> Handle(
       ErrorRequest request,
       CancellationToken cancellationToken = default)
        {
            return await _errorLogService.AddErrorLog(request.ErrorLogModel);
        }
    }
}
