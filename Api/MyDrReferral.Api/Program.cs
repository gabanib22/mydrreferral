using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using MyDrReferral.Api.Mapper;
using MyDrReferral.Api.MediatR;
using MyDrReferral.Data.Models;
using MyDrReferral.Data.Interceptors;
using MyDrReferral.Service.Interface;
using MyDrReferral.Service.Models;
using MyDrReferral.Service.Services;
using System.Text;

// MUST set Npgsql switches BEFORE creating WebApplication builder
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

#region Dependency Injections
// Read connection string from configuration (appsettings.json / environment)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

Console.WriteLine("🔧 Using configured DefaultConnection for PostgreSQL");

builder.Services.AddDbContext<MyDrReferralContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure();
    });
    
    // Add interceptor to fix DateTime parameters right before SQL execution
    options.AddInterceptors(new DateTimeInterceptor());
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
     .AddEntityFrameworkStores<MyDrReferralContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IErrorLogService, ErrorLogService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IConnectionService, ConnectionService>();
builder.Services.AddScoped<IRefferService, RefferService>();

//Mapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Register the MediatR request handlers
builder.Services.RegisterRequestHandlers();
#endregion


#region JWT Authentication & Authorization
// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key not found"));
        var issuer = builder.Configuration["JWT:Issuer"] ?? throw new InvalidOperationException("JWT:Issuer not found");
        var audience = builder.Configuration["JWT:Audience"] ?? throw new InvalidOperationException("JWT:Audience not found");
        
        Console.WriteLine($"JWT Configuration - Issuer: {issuer}, Audience: {audience}");
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero,
            RequireExpirationTime = true,
            RequireSignedTokens = true
        };
        
        // Configure JWT Bearer Events
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"JWT Authentication Failed: {context.Exception.Message}");
                Console.WriteLine($"Request Path: {context.Request.Path}");
                Console.WriteLine($"Authorization Header: {context.Request.Headers.Authorization}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("JWT Token validated successfully");
                Console.WriteLine($"Request Path: {context.Request.Path}");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"JWT Challenge: {context.Error}, {context.ErrorDescription}");
                Console.WriteLine($"Request Path: {context.Request.Path}");
                Console.WriteLine($"Authorization Header: {context.Request.Headers.Authorization}");
                
                // Prevent redirect to /Account/Login - return 401 instead
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                var result = System.Text.Json.JsonSerializer.Serialize(new { message = "Unauthorized" });
                return context.Response.WriteAsync(result);
            },
            OnMessageReceived = context =>
            {
                Console.WriteLine($"JWT Message Received - Path: {context.Request.Path}");
                Console.WriteLine($"Authorization Header: {context.Request.Headers.Authorization}");
                return Task.CompletedTask;
            }
        };
    });

// Add Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAuthentication", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
#endregion


#region Email Settings for Send Forgot/Reset Password Link to User
var emailConfig = builder.Configuration.GetSection("EmailConfiguration").Get<EmailSettings>();
builder.Services.AddSingleton(emailConfig);


//Valid token for 30 Minutes
builder.Services.Configure<DataProtectionTokenProviderOptions>(opt =>
{
    opt.TokenLifespan = TimeSpan.FromHours(2);
    //opt.TokenLifespan = TimeSpan.FromMinutes(30);
});
#endregion


var app = builder.Build();

// Apply database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var dbContext = services.GetRequiredService<MyDrReferralContext>();

    try
    {
        logger.LogInformation("Applying database migrations...");
        Console.WriteLine("🔧 Applying database migrations...");
        dbContext.Database.Migrate();
        logger.LogInformation("Database migrations applied successfully.");
        Console.WriteLine("✅ Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying database migrations.");
        Console.WriteLine($"❌ Migration error: {ex.Message}");
        Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
        throw;
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS
app.UseCors("AllowAllOrigins");

// Add request logging middleware
app.Use(async (context, next) =>
{
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");
    Console.WriteLine($"Authorization Header: {context.Request.Headers.Authorization}");
    await next();
});

// Add comprehensive exception handling middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ EXCEPTION CAUGHT:");
        Console.WriteLine($"Exception Type: {ex.GetType().Name}");
        Console.WriteLine($"Exception Message: {ex.Message}");
        Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
        Console.WriteLine($"Request Path: {context.Request.Path}");
        Console.WriteLine($"Request Method: {context.Request.Method}");
        Console.WriteLine($"Request Headers: {string.Join(", ", context.Request.Headers.Select(h => $"{h.Key}={h.Value}"))}");
        
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        var errorResponse = new
        {
            error = "Internal Server Error",
            message = ex.Message,
            details = ex.ToString(),
            path = context.Request.Path,
            method = context.Request.Method,
            timestamp = DateTime.UtcNow
        };
        
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(errorResponse));
    }
});

app.UseHttpsRedirection();

// Authentication and Authorization must be in this order
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
