using Caisse.Api.Middleware;
using Caisse.Application;
using Caisse.Application.Sessions.Commands;
using Caisse.Application.Sessions.Queries;
using Caisse.Application.Devises.Commands;
using Caisse.Application.Devises.Queries;
using Caisse.Application.Articles.Commands;
using Caisse.Application.Articles.Queries;
using Caisse.Application.Details.Commands;
using Caisse.Application.Details.Queries;
using Caisse.Application.Coffre.Commands;
using Caisse.Application.Coffre.Queries;
using Caisse.Application.Parametres.Queries;
using Caisse.Application.DevisesRef.Queries;
using Caisse.Application.CaisseDevises.Queries;
using Caisse.Application.CaisseDevises.Commands;
using Caisse.Infrastructure;
using MediatR;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    app.UseValidationExceptionHandler();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    // ============ Sessions Endpoints ============
    var sessions = app.MapGroup("/api/sessions").WithTags("Sessions");

    sessions.MapGet("/", async (string? utilisateur, int? limit, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSessionsQuery(utilisateur, limit ?? 10));
        return Results.Ok(result);
    })
    .WithName("GetSessions")
    .WithOpenApi();

    sessions.MapPost("/ouvrir", async (OuvrirSessionCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("OuvrirSession")
    .WithOpenApi();

    sessions.MapPost("/fermer", async (FermerSessionCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("FermerSession")
    .WithOpenApi();

    // ============ Devises Endpoints ============
    var devises = app.MapGroup("/api/devises").WithTags("Devises");

    devises.MapGet("/{utilisateur}/{chronoSession}", async (
        string utilisateur,
        double chronoSession,
        string? quand,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSessionDevisesQuery(utilisateur, chronoSession, quand));
        return Results.Ok(result);
    })
    .WithName("GetSessionDevises")
    .WithOpenApi();

    devises.MapGet("/{utilisateur}/{chronoSession}/summary", async (
        string utilisateur,
        double chronoSession,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDeviseSummaryQuery(utilisateur, chronoSession));
        return Results.Ok(result);
    })
    .WithName("GetDeviseSummary")
    .WithOpenApi();

    devises.MapPost("/", async (AddSessionDeviseCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("AddSessionDevise")
    .WithOpenApi();

    // ============ Articles Endpoints ============
    var articles = app.MapGroup("/api/articles").WithTags("Articles");

    articles.MapGet("/{utilisateur}/{chronoSession}", async (
        string utilisateur,
        double chronoSession,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSessionArticlesQuery(utilisateur, chronoSession));
        return Results.Ok(result);
    })
    .WithName("GetSessionArticles")
    .WithOpenApi();

    articles.MapGet("/{utilisateur}/{chronoSession}/summary", async (
        string utilisateur,
        double chronoSession,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetArticleSummaryQuery(utilisateur, chronoSession));
        return Results.Ok(result);
    })
    .WithName("GetArticleSummary")
    .WithOpenApi();

    articles.MapPost("/", async (AddSessionArticleCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("AddSessionArticle")
    .WithOpenApi();

    // ============ Details Endpoints ============
    var details = app.MapGroup("/api/details").WithTags("Details");

    details.MapGet("/{utilisateur}/{chronoSession}", async (
        string utilisateur,
        double chronoSession,
        string? type,
        string? quand,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSessionDetailsQuery(utilisateur, chronoSession, type, quand));
        return Results.Ok(result);
    })
    .WithName("GetSessionDetails")
    .WithOpenApi();

    details.MapGet("/{utilisateur}/{chronoSession}/summary", async (
        string utilisateur,
        double chronoSession,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDetailSummaryQuery(utilisateur, chronoSession));
        return Results.Ok(result);
    })
    .WithName("GetDetailSummary")
    .WithOpenApi();

    details.MapPost("/", async (AddSessionDetailCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("AddSessionDetail")
    .WithOpenApi();

    // ============ Coffre Endpoints ============
    var coffre = app.MapGroup("/api/coffre").WithTags("Coffre");

    coffre.MapGet("/", async (string? utilisateur, int? limit, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetCoffreQuery(utilisateur, limit ?? 20));
        return Results.Ok(result);
    })
    .WithName("GetCoffre")
    .WithOpenApi();

    coffre.MapGet("/{utilisateur}/{chrono}", async (
        string utilisateur,
        double chrono,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetCoffreBySessionQuery(utilisateur, chrono));
        return result != null ? Results.Ok(result) : Results.NotFound();
    })
    .WithName("GetCoffreBySession")
    .WithOpenApi();

    coffre.MapPost("/", async (AddCoffreCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("AddCoffre")
    .WithOpenApi();

    // ============ Parametres Endpoints ============
    var parametres = app.MapGroup("/api/parametres").WithTags("Parametres");

    parametres.MapGet("/", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetAllParametresQuery());
        return Results.Ok(result);
    })
    .WithName("GetAllParametres")
    .WithOpenApi();

    parametres.MapGet("/{cle}", async (string cle, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetParametresQuery(cle));
        return result != null ? Results.Ok(result) : Results.NotFound();
    })
    .WithName("GetParametres")
    .WithOpenApi();

    // ============ Devises Reference Endpoints ============
    var devisesRef = app.MapGroup("/api/devises-ref").WithTags("DevisesReference");

    devisesRef.MapGet("/", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetAllDevisesRefQuery());
        return Results.Ok(result);
    })
    .WithName("GetAllDevisesRef")
    .WithOpenApi();

    devisesRef.MapGet("/{codeDevise}", async (string codeDevise, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDeviseRefQuery(codeDevise));
        return result != null ? Results.Ok(result) : Results.NotFound();
    })
    .WithName("GetDeviseRef")
    .WithOpenApi();

    // ============ Caisse Devises (Config) Endpoints ============
    var caisseDevises = app.MapGroup("/api/caisse-devises").WithTags("CaisseDevises");

    caisseDevises.MapGet("/", async (
        string? utilisateur,
        string? codeDevise,
        string? modePaiement,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetCaisseDevisesQuery(utilisateur, codeDevise, modePaiement));
        return Results.Ok(result);
    })
    .WithName("GetCaisseDevises")
    .WithOpenApi();

    caisseDevises.MapPut("/", async (UpdateCaisseDeviseCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("UpdateCaisseDevise")
    .WithOpenApi();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
