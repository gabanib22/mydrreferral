using System.Runtime.CompilerServices;

namespace MyDrReferral.Service
{
    public static class Common
    {
        public static string GetErrorSubject(string parameterName = "", [CallerFilePath] string className = "", [CallerMemberName] string methodName = "")
        {
            var file = className.Split('\\').Last();

            if (!string.IsNullOrWhiteSpace(parameterName))
            {
                return $"Exception : Service={file} | Method={methodName} | Parameter={parameterName}";
            }
            else
            {
                return $"Exception : Service={file} | Method={methodName}";
            }
        }

        public enum UserType
        {
            Admin=1,
            Agent=2,
            Doctor=3,
            Laboratory=4

        }

        public enum ConnectionStatusType
        {
            Initiated = 1,
            InProgress = 2,
            PendingPayment = 3,
            Paid = 4,
            Completed = 5,
            Cancelled = 6
        }
    }
}
