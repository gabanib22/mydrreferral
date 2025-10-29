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
            var cmdText = command.CommandText ?? "";
            var preview = cmdText.Length > 100 ? cmdText.Substring(0, 100) : cmdText;
            Console.WriteLine($"🚨 ReaderExecuting: CommandText = {preview}");
            FixDateTimeParameters(command);
            return base.ReaderExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            var cmdText = command.CommandText ?? "";
            var preview = cmdText.Length > 100 ? cmdText.Substring(0, 100) : cmdText;
            Console.WriteLine($"🚨 ReaderExecutingAsync: CommandText = {preview}");
            FixDateTimeParameters(command);
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override InterceptionResult<int> NonQueryExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result)
        {
            var cmdText = command.CommandText ?? "";
            var preview = cmdText.Length > 100 ? cmdText.Substring(0, 100) : cmdText;
            Console.WriteLine($"🚨 NonQueryExecuting: CommandText = {preview}");
            FixDateTimeParameters(command);
            return base.NonQueryExecuting(command, eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            var cmdText = command.CommandText ?? "";
            var preview = cmdText.Length > 100 ? cmdText.Substring(0, 100) : cmdText;
            Console.WriteLine($"🚨 NonQueryExecutingAsync: CommandText = {preview}");
            FixDateTimeParameters(command);
            return base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
        }

        private void FixDateTimeParameters(DbCommand command)
        {
            Console.WriteLine($"🔧 FixDateTimeParameters: Checking {command.Parameters.Count} parameters");
            System.Diagnostics.Debug.WriteLine($"🔧 FixDateTimeParameters: Checking {command.Parameters.Count} parameters");
            
            try
            {
                System.IO.File.AppendAllText("/tmp/mydrreferral-interceptor.log", 
                    $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] FixDateTimeParameters: Checking {command.Parameters.Count} parameters\n");
            }
            catch { }
            
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

