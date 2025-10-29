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
            Console.WriteLine($"🚨 ReaderExecuting: CommandText = {command.CommandText?.Substring(0, Math.Min(100, command.CommandText.Length ?? 0))}");
            FixDateTimeParameters(command);
            return base.ReaderExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"🚨 ReaderExecutingAsync: CommandText = {command.CommandText?.Substring(0, Math.Min(100, command.CommandText.Length ?? 0))}");
            FixDateTimeParameters(command);
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override InterceptionResult<int> NonQueryExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result)
        {
            Console.WriteLine($"🚨 NonQueryExecuting: CommandText = {command.CommandText?.Substring(0, Math.Min(100, command.CommandText.Length ?? 0))}");
            FixDateTimeParameters(command);
            return base.NonQueryExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"🚨 NonQueryExecutingAsync: CommandText = {command.CommandText?.Substring(0, Math.Min(100, command.CommandText.Length ?? 0))}");
            FixDateTimeParameters(command);
            return base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
        }

        private void FixDateTimeParameters(DbCommand command)
        {
            Console.WriteLine($"🔧 FixDateTimeParameters: Checking {command.Parameters.Count} parameters");
            
            foreach (DbParameter parameter in command.Parameters)
            {
                if (parameter.Value != null)
                {
                    var valueType = parameter.Value.GetType();
                    Console.WriteLine($"🔍 Parameter: {parameter.ParameterName}, Type: {valueType.Name}, Value: {parameter.Value}");
                    
                    if (valueType == typeof(DateTime))
                    {
                        DateTime dt = (DateTime)parameter.Value;
                        Console.WriteLine($"🔍 DateTime Kind: {dt.Kind}");
                        if (dt.Kind != DateTimeKind.Utc)
                        {
                            var fixedDt = DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc);
                            parameter.Value = fixedDt;
                            Console.WriteLine($"✅ FIXED! Parameter {parameter.ParameterName} from {dt.Kind} to UTC");
                        }
                        else
                        {
                            Console.WriteLine($"ℹ️ Parameter {parameter.ParameterName} already UTC");
                        }
                    }
                    else if (valueType == typeof(DateTime?))
                    {
                        DateTime? nullableDt = (DateTime?)parameter.Value;
                        if (nullableDt.HasValue)
                        {
                            Console.WriteLine($"🔍 Nullable DateTime Kind: {nullableDt.Value.Kind}");
                            if (nullableDt.Value.Kind != DateTimeKind.Utc)
                            {
                                var fixedDt = DateTime.SpecifyKind(nullableDt.Value.ToUniversalTime(), DateTimeKind.Utc);
                                parameter.Value = (DateTime?)fixedDt;
                                Console.WriteLine($"✅ FIXED! Nullable parameter {parameter.ParameterName} from {nullableDt.Value.Kind} to UTC");
                            }
                            else
                            {
                                Console.WriteLine($"ℹ️ Nullable parameter {parameter.ParameterName} already UTC");
                            }
                        }
                    }
                }
            }
        }
    }
}

