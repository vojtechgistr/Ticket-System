// This is just a demo app that contains most of the technologies listed on the 'C# Developer' job post.
// Job post - https://www.blogic.cz/kariera/csharp-developer


using System.Text;
using API.Services;
using DataAccessLibrary.DataAccess;
using DataAccessLibrary.Managers;
using DataAccessLibrary.Models;
using DataAccessLibrary.Services;
using DataAccessLibrary.Structures;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
});

builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddRoles<ApplicationRole>()
    .AddRoleManager<RoleManager<ApplicationRole>>()
    .AddEntityFrameworkStores<DataContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
            ValidAudience = builder.Configuration["JWT:ValidAudience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"])),
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken)
                    && path.StartsWithSegments("/messageHub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OwnerRights", policy => { policy.RequireRole(RoleTypes.Owner); });

    options.AddPolicy("AdminRights", policy => { policy.RequireRole(RoleTypes.Admin, RoleTypes.Owner); });

    options.AddPolicy("ModeratorRights",
        policy => { policy.RequireRole(RoleTypes.Moderator, RoleTypes.Admin, RoleTypes.Owner); });

    options.AddPolicy("UserRights",
        policy => { policy.RequireRole(RoleTypes.User, RoleTypes.Moderator, RoleTypes.Admin, RoleTypes.Owner); });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactDevClient", policyBuilder =>
    {
        var origins = builder.Configuration["JWT:ValidAudience"] ?? throw new Exception("No origin exists");
        policyBuilder.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSignalR();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<TicketsHub>();

builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<IJWTProviderService, JWTProviderService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();

builder.Services.AddSingleton<IIdProviderService, IdProviderService>();
builder.Services.AddSingleton<ITagProviderService, TagProviderService>();
builder.Services.AddSingleton<ITicketDatabase, ElasticTicketDatabase>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Void Dashboard APi", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      \r\n\r\nExample: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer",
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactDevClient");
app.UseHttpsRedirection();

app.UseAuthentication();

app.UseRouting();
app.UseAuthorization();
app.UseEndpoints(endpoints => { endpoints.MapHub<TicketsHub>("/messageHub"); });

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await SeedManager.Seed(services);
}

app.Run();

// This is just a demo app that contains most of the technologies listed on the 'C# Developer' job post.
// Job post - https://www.blogic.cz/kariera/csharp-developer