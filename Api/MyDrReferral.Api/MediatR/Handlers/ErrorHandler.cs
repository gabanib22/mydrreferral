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
            // Temporarily disable database error logging until migrations are complete
            Console.WriteLine($"ERROR LOGGED: {request.ErrorLogModel?.Description}");
            Console.WriteLine($"SUBJECT: {request.ErrorLogModel?.Subject}");
            Console.WriteLine($"STACK TRACE: {request.ErrorLogModel?.StackTrace}");
            
            // Return true to indicate "success" without actually logging to database
            return await Task.FromResult(true);
        }
    }
}
