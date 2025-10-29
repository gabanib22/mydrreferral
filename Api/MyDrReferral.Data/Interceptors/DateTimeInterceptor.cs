using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;
using System.Diagnostics;

namespace MyDrReferral.Data.Interceptors
{
    public class DateTimeInterceptor : DbCommandInterceptor
    {
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            FixDateTimeParameters(command);
            return base.ReaderExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            FixDateTimeParameters(command);
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override InterceptionResult<int> NonQueryExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result)
        {
            FixDateTimeParameters(command);
            return base.NonQueryExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            FixDateTimeParameters(command);
            return base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
        }

        private void FixDateTimeParameters(DbCommand command)
        {
            foreach (DbParameter parameter in command.Parameters)
            {
                if (parameter.Value != null)
                {
                    var valueType = parameter.Value.GetType();
                    
                    if (valueType == typeof(DateTime))
                    {
                        DateTime dt = (DateTime)parameter.Value;
                        if (dt.Kind != DateTimeKind.Utc)
                        {
                            parameter.Value = DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc);
                        }
                    }
                    else if (valueType == typeof(DateTime?))
                    {
                        DateTime? nullableDt = (DateTime?)parameter.Value;
                        if (nullableDt.HasValue && nullableDt.Value.Kind != DateTimeKind.Utc)
                        {
                            parameter.Value = (DateTime?)DateTime.SpecifyKind(nullableDt.Value.ToUniversalTime(), DateTimeKind.Utc);
                        }
                    }
                }
            }
        }
    }
}

