using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace Caisse.Api.Middleware;

public static class ValidationExceptionHandler
{
    public static void UseValidationExceptionHandler(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(appError =>
        {
            appError.Run(async context =>
            {
                var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
                var exception = exceptionFeature?.Error;

                if (exception is ValidationException validationException)
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    context.Response.ContentType = "application/json";

                    var errors = validationException.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(
                            g => g.Key,
                            g => g.Select(e => e.ErrorMessage).ToArray());

                    await context.Response.WriteAsJsonAsync(new
                    {
                        type = "ValidationError",
                        title = "Validation failed",
                        status = 400,
                        errors
                    });
                }
                else
                {
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    context.Response.ContentType = "application/json";

                    await context.Response.WriteAsJsonAsync(new
                    {
                        type = "Error",
                        title = exception?.Message ?? "An error occurred",
                        status = 500
                    });
                }
            });
        });
    }
}
