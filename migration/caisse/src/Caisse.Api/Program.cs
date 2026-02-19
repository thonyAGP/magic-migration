using Caisse.Api.Middleware;
using Caisse.Application;
using Microsoft.Extensions.FileProviders;
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
using Caisse.Application.Ecarts.Queries;
using Caisse.Application.Ventes.Queries;
using Caisse.Application.Ventes.Commands;
using Caisse.Application.EasyCheckOut.Commands;
using Caisse.Application.EasyCheckOut.Queries;
using Caisse.Application.Zooms.Queries;
using Caisse.Application.Members.Queries;
using Caisse.Application.Solde.Queries;
using Caisse.Application.Solde.Commands;
using Caisse.Application.Extrait.Queries;
using Caisse.Application.Garanties.Queries;
using Caisse.Application.Change.Queries;
using Caisse.Application.Change.Commands;
using Caisse.Application.Telephone.Queries;
using Caisse.Application.Telephone.Commands;
using Caisse.Application.Factures.Queries;
using Caisse.Application.Factures.Commands;
using Caisse.Application.Identification.Queries;
using Caisse.Application.Identification.Commands;
using Caisse.Application.EzCard.Queries;
using Caisse.Application.EzCard.Commands;
using Caisse.Application.Depot.Queries;
using Caisse.Application.Depot.Commands;
using Caisse.Application.Divers.Queries;
using Caisse.Application.Divers.Commands;
using Caisse.Application.Utilitaires.Queries;
using Caisse.Application.Utilitaires.Commands;
using Caisse.Application.Menus.Queries;
using Caisse.Application.ChangementCompte.Queries;
using Caisse.Application.ChangementCompte.Commands;
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

    // CORS for ADH Web frontend (dev: Vite on port 3071)
    builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:3071")
              .AllowAnyMethod()
              .AllowAnyHeader()));

    var app = builder.Build();

    app.UseCors();
    app.UseValidationExceptionHandler();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseDefaultFiles();
    app.UseStaticFiles();

    // Serve Magic images from configured path (MagicPaths:ClubImages)
    var clubImagesPath = builder.Configuration["MagicPaths:ClubImages"];
    if (!string.IsNullOrEmpty(clubImagesPath) && Directory.Exists(clubImagesPath))
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(clubImagesPath),
            RequestPath = "/magic-images"
        });
        Log.Information("Magic images served from: {Path}", clubImagesPath);
    }
    else
    {
        Log.Warning("Magic images path not found: {Path}. Using fallback.", clubImagesPath);
    }

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

    // Prg_116: Vérification concurrence sessions
    sessions.MapGet("/concurrence/{utilisateur}", async (string utilisateur, IMediator mediator) =>
    {
        var sessions = await mediator.Send(new GetSessionsQuery(utilisateur, 10));
        var hasOpenSession = sessions.Any(s => s.EstOuverte);
        return Results.Ok(new { CanOpen = !hasOpenSession, HasOpenSession = hasOpenSession });
    })
    .WithName("CheckSessionConcurrence")
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

    // ============ Ecarts Endpoints ============
    var ecarts = app.MapGroup("/api/ecarts").WithTags("Ecarts");

    ecarts.MapGet("/{utilisateur}/{chronoSession}", async (
        string utilisateur,
        double chronoSession,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new CalculerEcartSessionQuery(utilisateur, chronoSession));
        return Results.Ok(result);
    })
    .WithName("CalculerEcartSession")
    .WithOpenApi();

    // ============ Ventes Endpoints ============
    var ventes = app.MapGroup("/api/ventes").WithTags("Ventes");

    ventes.MapGet("/solde-giftpass/{societe}/{compte}/{filiation}", async (
        string societe,
        int compte,
        int filiation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSoldeGiftPassQuery(societe, compte, filiation));
        return Results.Ok(result);
    })
    .WithName("GetSoldeGiftPass")
    .WithOpenApi();

    ventes.MapGet("/solde-resortcredit/{societe}/{compte}/{filiation}/{service}", async (
        string societe,
        int compte,
        int filiation,
        string service,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSoldeResortCreditQuery(societe, compte, filiation, service));
        return Results.Ok(result);
    })
    .WithName("GetSoldeResortCredit")
    .WithOpenApi();

    ventes.MapGet("/historique/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        string? dateDebut,
        string? dateFin,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetHistoVentesQuery(societe, codeGm, filiation, dateDebut, dateFin, limit ?? 50));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetHistoVentes")
    .WithOpenApi();

    ventes.MapGet("/historique-igr/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        string? dateDebut,
        string? dateFin,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetHistoVentesIgrQuery(societe, codeGm, filiation, dateDebut, dateFin, limit ?? 50));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetHistoVentesIgr")
    .WithOpenApi();

    ventes.MapGet("/historique-gratuits/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        string? dateDebut,
        string? dateFin,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetHistoVentesGratuitesQuery(societe, codeGm, filiation, dateDebut, dateFin, limit ?? 50));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetHistoVentesGratuits")
    .WithOpenApi();

    ventes.MapPost("/initiate", async (InitiateNewSaleCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Created($"/api/ventes/{result.TransactionId}", result) : Results.BadRequest(result);
    })
    .WithName("InitiateNewSale")
    .WithOpenApi();

    ventes.MapPost("/add-detail", async (AddSaleDetailCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("AddSaleDetail")
    .WithOpenApi();

    ventes.MapPost("/validate", async (ValidateSaleCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("ValidateSale")
    .WithOpenApi();

    ventes.MapPost("/print-ticket", async (PrintTicketVenteCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("PrintTicketVente")
    .WithOpenApi();

    ventes.MapPost("/deversement", async (DeversementTransactionCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("DeversementTransaction")
    .WithOpenApi();

    ventes.MapPost("/choix-pyr", async (ChoixPyrCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("ChoixPyr")
    .WithOpenApi();

    ventes.MapPost("/creation-pied-ticket", async (CreationPiedTicketCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreationPiedTicket")
    .WithOpenApi();

    ventes.MapGet("/zoom/articles/{societe}", async (
        string societe,
        string? searchTerm,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetZoomArticlesQuery(societe, searchTerm, limit ?? 50));
        return Results.Ok(result);
    })
    .WithName("GetZoomArticles")
    .WithOpenApi();

    ventes.MapGet("/zoom/gratuits/{societe}", async (
        string societe,
        string? searchTerm,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetZoomGratuitesQuery(societe, searchTerm, limit ?? 100));
        return Results.Ok(result);
    })
    .WithName("GetZoomGratuits")
    .WithOpenApi();

    ventes.MapGet("/zoom/payment-methods/{societe}", async (
        string societe,
        int? codeGm,
        string? searchTerm,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetZoomPaymentMethodsQuery(societe, codeGm, searchTerm, limit ?? 100));
        return Results.Ok(result);
    })
    .WithName("GetZoomPaymentMethods")
    .WithOpenApi();

    ventes.MapGet("/vad-valides/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetVadValidesQuery(societe, codeGm, filiation, dateDebut, dateFin, limit ?? 50));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetVadValides")
    .WithOpenApi();

    // ============ Transactions Facade (ADH Web Lot 2) ============
    // These endpoints map the frontend URLs (adh-web) to existing CQRS handlers.
    // Frontend expects ApiResponse<T> = { data: T, success: bool, message?: string }
    var transactions = app.MapGroup("/api/transactions").WithTags("Transactions");

    transactions.MapGet("/pre-check", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new PreCheckSaleQuery());
        return Results.Ok(new { data = new { canSell = result.CanSell, reason = result.Reason }, success = true });
    })
    .WithName("TransactionPreCheck")
    .WithOpenApi();

    transactions.MapPost("/", async (CreateTransactionFacadeDto dto, IMediator mediator) =>
    {
        var command = new InitiateNewSaleCommand(
            Societe: dto.Societe ?? "",
            CodeGm: dto.CompteId,
            Filiation: dto.Filiation,
            ModePaiement: dto.ModePaiement ?? "ESP",
            Operateur: dto.Operateur ?? "",
            DateVente: DateOnly.FromDateTime(DateTime.Now),
            HeureVente: TimeOnly.FromDateTime(DateTime.Now),
            DeviseTransaction: dto.Devise);
        var result = await mediator.Send(command);
        if (!result.Success) return Results.BadRequest(new { data = (object?)null, success = false, message = result.Message });
        return Results.Ok(new { data = new { id = result.TransactionId }, success = true, message = result.Message });
    })
    .WithName("TransactionCreate")
    .WithOpenApi();

    transactions.MapPost("/{txId}/check-giftpass", async (long txId, CheckGiftPassFacadeDto dto, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSoldeGiftPassQuery(dto.Societe, dto.Compte, dto.Filiation));
        var available = result.SoldeCreditConso > 0;
        return Results.Ok(new
        {
            data = new { balance = result.SoldeCreditConso, available, devise = "EUR" },
            success = true
        });
    })
    .WithName("TransactionCheckGiftPass")
    .WithOpenApi();

    transactions.MapPost("/{txId}/check-resort-credit", async (long txId, CheckResortCreditFacadeDto dto, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSoldeResortCreditQuery(dto.Societe, dto.Compte, dto.Filiation, dto.Service ?? ""));
        return Results.Ok(new
        {
            data = new { balance = result.SoldeResortCredit, available = result.Found && result.SoldeResortCredit > 0, devise = "EUR" },
            success = true
        });
    })
    .WithName("TransactionCheckResortCredit")
    .WithOpenApi();

    transactions.MapPost("/{txId}/complete", async (long txId, CompleteTransactionFacadeDto dto, IMediator mediator) =>
    {
        var command = new ValidateSaleCommand(
            TransactionId: txId,
            Societe: dto.Societe ?? "",
            CodeGm: dto.CodeGm,
            Filiation: dto.Filiation,
            MontantTotal: dto.MontantTotal,
            MontantTva: dto.MontantTva,
            DeviseTransaction: dto.DeviseTransaction ?? "EUR",
            CommentaireVente: dto.Commentaire);
        var result = await mediator.Send(command);
        if (!result.Success) return Results.BadRequest(new { data = (object?)null, success = false, message = result.Message });
        return Results.Ok(new { data = (object?)null, success = true, message = result.Message });
    })
    .WithName("TransactionComplete")
    .WithOpenApi();

    transactions.MapPost("/{txId}/recover-tpe", async (long txId, RecoverTPEFacadeDto dto, IMediator mediator) =>
    {
        var mops = dto.NewMOP?.Select(m => new RecoverTPEMop(m.Code, m.Montant)).ToList() ?? new();
        var result = await mediator.Send(new RecoverTPECommand(txId, mops));
        if (!result.Success) return Results.BadRequest(new { data = (object?)null, success = false, message = result.Message });
        return Results.Ok(new { data = (object?)null, success = true, message = result.Message });
    })
    .WithName("TransactionRecoverTPE")
    .WithOpenApi();

    // Standalone facade endpoints (not under /api/transactions)
    app.MapGet("/api/moyen-paiements", async (string? societe, IMediator mediator) =>
    {
        var soc = societe ?? "";
        var moyens = await mediator.Send(new GetMoyensReglementQuery(soc));
        var mapped = moyens.Select(m => new
        {
            code = m.Mop,
            libelle = m.Mop,
            type = MapMopType(m.TypeOperation),
            classe = m.Devise,
            estTPE = m.TypeOperation == "CB"
        }).ToList();
        return Results.Ok(new { data = mapped, success = true });
    })
    .WithName("GetMoyenPaiementsFacade")
    .WithTags("Transactions")
    .WithOpenApi();

    app.MapGet("/api/forfaits", async (string? articleType, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetForfaitsQuery(articleType));
        var mapped = result.Forfaits.Select(f => new
        {
            code = f.Code,
            libelle = f.Libelle,
            dateDebut = f.DateDebut,
            dateFin = f.DateFin,
            articleType = f.ArticleType,
            prixParJour = f.PrixParJour,
            prixForfait = f.PrixForfait
        }).ToList();
        return Results.Ok(new { data = mapped, success = true });
    })
    .WithName("GetForfaitsFacade")
    .WithTags("Transactions")
    .WithOpenApi();

    app.MapGet("/api/terminal/edition-config", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetEditionConfigQuery());
        return Results.Ok(new
        {
            data = new { format = result.Format, printerId = result.PrinterId, printerName = result.PrinterName },
            success = true
        });
    })
    .WithName("GetEditionConfigFacade")
    .WithTags("Transactions")
    .WithOpenApi();

    // ============ EasyCheckOut Endpoints ============
    var checkout = app.MapGroup("/api/easycheckout").WithTags("EasyCheckOut");

    checkout.MapPost("/solde", async (SoldeEasyCheckOutCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.TransactionValidee ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("SoldeEasyCheckOut")
    .WithOpenApi();

    checkout.MapGet("/edition", async (
        bool erreursSeules,
        bool editionAuto,
        bool testPes,
        DateOnly dateEdition,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new EditionEasyCheckOutQuery(erreursSeules, editionAuto, testPes, dateEdition));
        return Results.Ok(result);
    })
    .WithName("EditionEasyCheckOut")
    .WithOpenApi();

    checkout.MapGet("/extrait/{societe}/{dateDepart}", async (
        string societe,
        DateOnly dateDepart,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new ExtraitEasyCheckOutQuery(societe, dateDepart));
        return Results.Ok(result);
    })
    .WithName("ExtraitEasyCheckOut")
    .WithOpenApi();

    // ============ Zooms Endpoints ============
    var zooms = app.MapGroup("/api/zooms").WithTags("Zooms");

    zooms.MapGet("/moyens-reglement/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetMoyensReglementQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetMoyensReglement")
    .WithOpenApi();

    zooms.MapGet("/tables/{nomTable}", async (string nomTable, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetTablesReferenceQuery(nomTable));
        return Results.Ok(result);
    })
    .WithName("GetTablesReference")
    .WithOpenApi();

    zooms.MapGet("/devises/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDevisesZoomQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetDevisesZoom")
    .WithOpenApi();

    zooms.MapGet("/garanties/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetGarantiesQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetGaranties")
    .WithOpenApi();

    zooms.MapGet("/depots-objets/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDepotsObjetsQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetDepotsObjets")
    .WithOpenApi();

    zooms.MapGet("/depots-devises/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDepotsDevisesQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetDepotsDevises")
    .WithOpenApi();

    zooms.MapGet("/pays", async (string? codeLangue, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetPaysQuery(codeLangue));
        return Results.Ok(result);
    })
    .WithName("GetPays")
    .WithOpenApi();

    zooms.MapGet("/types-taux-change/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetTypesTauxChangeQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetTypesTauxChange")
    .WithOpenApi();

    zooms.MapGet("/comptes/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetComptesZoomQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetComptesZoom")
    .WithOpenApi();

    // types-objets endpoint removed - TypeObjetZoom entity was incorrect

    // modes-paiement endpoint removed - use moyens-reglement instead (same table)

    zooms.MapGet("/services-village", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetServicesVillageQuery());
        return Results.Ok(result);
    })
    .WithName("GetServicesVillage")
    .WithOpenApi();

    // ============ Members Endpoints ============
    var members = app.MapGroup("/api/members").WithTags("Members");

    members.MapGet("/club-med-pass/{societe}/{compte}/{filiation}", async (
        string societe,
        int compte,
        int filiation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetClubMedPassQuery(societe, compte, filiation));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetClubMedPass")
    .WithOpenApi();

    // ============ Solde Endpoints ============
    var solde = app.MapGroup("/api/solde").WithTags("Solde");

    solde.MapGet("/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateSolde,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSoldeCompteQuery(societe, codeAdherent, filiation, dateSolde));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetSoldeCompte")
    .WithOpenApi();

    solde.MapGet("/menu/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSoldeMenuQuery(societe, codeAdherent, filiation));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetSoldeMenu")
    .WithOpenApi();

    solde.MapPost("/print-guarantee", async (PrintSoldeGarantieCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("PrintSoldeGarantie")
    .WithOpenApi();

    // ============ Extrait Endpoints ============
    var extrait = app.MapGroup("/api/extrait").WithTags("Extrait");

    extrait.MapGet("/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        string? triPar,
        string? codeService,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitCompteQuery(
            societe, codeAdherent, filiation, dateDebut, dateFin, triPar, codeService));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitCompte")
    .WithOpenApi();

    extrait.MapGet("/detail/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitDetailQuery(
            societe, codeAdherent, filiation, dateDebut, dateFin));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitDetail")
    .WithOpenApi();

    extrait.MapGet("/par-nom/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitNomQuery(
            societe, codeAdherent, filiation, dateDebut, dateFin));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitParNom")
    .WithOpenApi();

    extrait.MapGet("/par-date/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitDateQuery(
            societe, codeAdherent, filiation, dateDebut, dateFin));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitParDate")
    .WithOpenApi();

    extrait.MapGet("/cumul/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitCumulQuery(
            societe, codeAdherent, filiation, dateDebut, dateFin));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitCumul")
    .WithOpenApi();

    extrait.MapGet("/impression/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitImpQuery(
            societe, codeAdherent, filiation, dateDebut, dateFin));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitImpression")
    .WithOpenApi();

    extrait.MapGet("/date-impression/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitDateImpQuery(
            societe, codeAdherent, filiation, dateDebut, dateFin));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitDateImpression")
    .WithOpenApi();

    extrait.MapGet("/par-service/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        string? codeService,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitServiceQuery(
            societe, codeAdherent, filiation, dateDebut, dateFin, codeService));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitParService")
    .WithOpenApi();

    // ============ Garanties Endpoints ============
    var garanties = app.MapGroup("/api/garanties").WithTags("Garanties");

    garanties.MapGet("/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetGarantieCompteQuery(societe, codeAdherent, filiation));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetGarantieCompte")
    .WithOpenApi();

    garanties.MapGet("/selection", async (
        string societe,
        string? typeDepot,
        string? codeDevise,
        string? etatDepot,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetGarantieSelectionQuery(societe, typeDepot, codeDevise, etatDepot));
        return Results.Ok(result);
    })
    .WithName("GetGarantieSelection")
    .WithOpenApi();

    garanties.MapGet("/types/{societe}", async (
        string societe,
        string? codeClasse,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetGarantieTypesQuery(societe, codeClasse));
        return Results.Ok(result);
    })
    .WithName("GetGarantieTypes")
    .WithOpenApi();

    // ============ Change Endpoints ============
    var change = app.MapGroup("/api/change").WithTags("Change");

    change.MapGet("/devise-locale/{societe}", async (
        string societe,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDeviseLocaleQuery(societe));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetDeviseLocale")
    .WithOpenApi();

    change.MapGet("/taux/{societe}", async (
        string societe,
        string? codeDevise,
        DateOnly? dateReference,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetTauxChangeQuery(societe, codeDevise, dateReference));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetTauxChange")
    .WithOpenApi();

    change.MapGet("/calculer", async (
        string societe,
        string typeDevise,
        string deviseSource,
        int nbDecimales,
        string deviseLocale,
        string? modePaiement,
        double montant,
        string typeOperation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new CalculerEquivalentQuery(
            societe, typeDevise, deviseSource, nbDecimales,
            deviseLocale, modePaiement ?? "", montant, typeOperation));
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CalculerEquivalent")
    .WithOpenApi();

    change.MapPost("/receipt/purchase", async (
        PrintReceiptPurchaseCommand command,
        IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("PrintReceiptPurchase")
    .WithOpenApi();

    change.MapPost("/receipt/sale", async (
        PrintReceiptSaleCommand command,
        IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("PrintReceiptSale")
    .WithOpenApi();

    // ============ Telephone Endpoints ============
    var telephone = app.MapGroup("/api/telephone").WithTags("Telephone");

    telephone.MapGet("/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetLigneTelephoneQuery(societe, codeGm, filiation));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetLignesTelephone")
    .WithOpenApi();

    telephone.MapPost("/gerer", async (GererLigneTelephoneCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("GererLigneTelephone")
    .WithOpenApi();

    telephone.MapPost("/init", async (InitPhoneLineCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("InitPhoneLine")
    .WithOpenApi();

    telephone.MapGet("/detail-appels/{societe}/{codeAutocom}", async (
        string societe,
        int codeAutocom,
        int? nbDecimales,
        string? nomVillage,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDetailAppelsTelephoneQuery(societe, codeAutocom, nbDecimales, nomVillage));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetDetailAppelsTelephone")
    .WithOpenApi();

    // ============ Factures Endpoints ============
    var factures = app.MapGroup("/api/factures").WithTags("Factures");

    factures.MapGet("/checkout/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetFacturesCheckOutQuery(societe, codeGm, filiation));
        return result.Success ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetFacturesCheckOut")
    .WithOpenApi();

    factures.MapPost("/creer", async (CreerFactureCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreerFacture")
    .WithOpenApi();

    // ============ Identification Endpoints ============
    var identification = app.MapGroup("/api/identification").WithTags("Identification");

    identification.MapPost("/verifier", async (VerifierOperateurQuery query, IMediator mediator) =>
    {
        var result = await mediator.Send(query);
        return result.Authentifie ? Results.Ok(result) : Results.Unauthorized();
    })
    .WithName("VerifierOperateur")
    .WithOpenApi();

    identification.MapGet("/session/{societe}/{codeOperateur}", async (
        string societe,
        string codeOperateur,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new VerifierSessionCaisseQuery(societe, codeOperateur));
        return Results.Ok(result);
    })
    .WithName("VerifierSessionCaisse")
    .WithOpenApi();

    identification.MapGet("/great-member-menu/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        string typeClient,
        string acces,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetGreatMemberMenuQuery(societe, codeGm, filiation, typeClient, acces));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetGreatMemberMenu")
    .WithOpenApi();

    identification.MapGet("/great-members", async (
        string societe,
        int? village,
        string? sexe,
        string? typeClient,
        string? typeCarte,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetGreatMembersListQuery(societe, village, sexe, typeClient, typeCarte));
        return Results.Ok(result);
    })
    .WithName("GetGreatMembersList")
    .WithOpenApi();

    identification.MapPost("/selection", async (SelectIdentificationCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("SelectIdentification")
    .WithOpenApi();

    // ============ EzCard Endpoints ============
    var ezcard = app.MapGroup("/api/ezcard").WithTags("EzCard");

    ezcard.MapGet("/member/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetEzCardByMemberQuery(societe, codeGm, filiation));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetEzCardByMember")
    .WithOpenApi();

    ezcard.MapPost("/desactiver", async (DesactiverEzCardCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("DesactiverEzCard")
    .WithOpenApi();

    ezcard.MapPost("/valider-caracteres", async (ValiderCaracteresQuery query, IMediator mediator) =>
    {
        var result = await mediator.Send(query);
        return Results.Ok(result);
    })
    .WithName("ValiderCaracteres")
    .WithOpenApi();

    // ============ Depot Endpoints ============
    var depot = app.MapGroup("/api/depot").WithTags("Depot");

    depot.MapGet("/extrait/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        string? nomVillage,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetExtraitDepotQuery(societe, codeGm, filiation, nomVillage));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetExtraitDepot")
    .WithOpenApi();

    depot.MapPost("/retirer", async (RetirerDepotCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("RetirerDepot")
    .WithOpenApi();

    // ============ Divers Endpoints ============
    var divers = app.MapGroup("/api/divers").WithTags("Divers");

    divers.MapGet("/langue/{societe}/{codeUtilisateur}", async (
        string societe,
        string codeUtilisateur,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetLangueUtilisateurQuery(societe, codeUtilisateur));
        return Results.Ok(result);
    })
    .WithName("GetLangueUtilisateur")
    .WithOpenApi();

    divers.MapGet("/titre/{codeEcran}", async (
        string codeEcran,
        string? typeProgramme,
        string? codeLangue,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetTitreEcranQuery(codeEcran, typeProgramme, codeLangue));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetTitreEcran")
    .WithOpenApi();

    divers.MapGet("/acces-informaticien/{societe}/{codeUtilisateur}", async (
        string societe,
        string codeUtilisateur,
        bool? supprimerMessages,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new VerifierAccesInformaticienQuery(
            societe, codeUtilisateur, supprimerMessages ?? false));
        return Results.Ok(result);
    })
    .WithName("VerifierAccesInformaticien")
    .WithOpenApi();

    divers.MapPost("/valider-dates", async (ValiderIntegriteDatesQuery query, IMediator mediator) =>
    {
        var result = await mediator.Send(query);
        return result.IsValid ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("ValiderIntegriteDates")
    .WithOpenApi();

    divers.MapPost("/session-timestamp", async (UpdateSessionTimestampCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("UpdateSessionTimestamp")
    .WithOpenApi();

    divers.MapGet("/version", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetVersionQuery());
        return Results.Ok(result);
    })
    .WithName("GetVersion")
    .WithOpenApi();

    divers.MapGet("/droits-utilisateur/{societe}/{codeUtilisateur}", async (
        string societe,
        string codeUtilisateur,
        string? typeDroit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new SearchUserRightsQuery(societe, codeUtilisateur, typeDroit));
        return result.UtilisateurTrouve ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("SearchUserRights")
    .WithOpenApi();

    divers.MapPost("/appeler-programme", async (CallProgramCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CallProgram")
    .WithOpenApi();

    // ============ Utilitaires Endpoints ============
    var utilitaires = app.MapGroup("/api/utilitaires").WithTags("Utilitaires");

    utilitaires.MapPost("/init", async (InitUtilitairesCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("InitUtilitaires")
    .WithOpenApi();

    utilitaires.MapPost("/backup", async (BackupConfigCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("BackupConfig")
    .WithOpenApi();

    utilitaires.MapPost("/restore", async (RestoreConfigCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("RestoreConfig")
    .WithOpenApi();

    utilitaires.MapPost("/export", async (ExportDataCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("ExportData")
    .WithOpenApi();

    utilitaires.MapPost("/import", async (ImportDataCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("ImportData")
    .WithOpenApi();

    utilitaires.MapPost("/purge", async (PurgeDataCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("PurgeData")
    .WithOpenApi();

    utilitaires.MapPost("/maintenance", async (MaintenanceDbCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("MaintenanceDb")
    .WithOpenApi();

    utilitaires.MapPost("/print-ticket", async (PrintTicketCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("PrintTicket")
    .WithOpenApi();

    utilitaires.MapGet("/logs", async (
        string? levelFilter,
        DateTime? dateDebut,
        DateTime? dateFin,
        string? messageFilter,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetLogViewerQuery(levelFilter, dateDebut, dateFin, messageFilter, limit));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetLogViewer")
    .WithOpenApi();

    utilitaires.MapGet("/system-info", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSystemInfoQuery());
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("GetSystemInfo")
    .WithOpenApi();

    // ============ Changement Compte Endpoints ============
    var changementCompte = app.MapGroup("/api/changement-compte").WithTags("ChangementCompte");

    changementCompte.MapPost("/init", async (
        string societe,
        int codeAdherent,
        int filiation,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new InitChangementCompteQuery(societe, codeAdherent, filiation));
        return Results.Ok(result);
    })
    .WithName("InitChangementCompte")
    .WithOpenApi();

    changementCompte.MapGet("/separation/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        string? typeFiltre,
        string? valeurFiltre,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetSeparationQuery(
            societe, codeAdherent, filiation, typeFiltre, valeurFiltre, limit));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetSeparation")
    .WithOpenApi();

    changementCompte.MapGet("/fusion/{societe}/{codeCompteSource}/{filiationSource}/{codeCompteCible}/{filiationCible}", async (
        string societe,
        int codeCompteSource,
        int filiationSource,
        int codeCompteCible,
        int filiationCible,
        string? typeFiltre,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetFusionQuery(
            societe, codeCompteSource, filiationSource, codeCompteCible, filiationCible, typeFiltre, limit));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetFusion")
    .WithOpenApi();

    changementCompte.MapPost("/histo-fus-sep", async (WriteHistoFusSepCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("WriteHistoFusSep")
    .WithOpenApi();

    changementCompte.MapGet("/histo-fus-sep-det/{societe}/{chrono}", async (
        string societe,
        long chrono,
        string? typeFusSep,
        string? positionReprise,
        int? numeroTache,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new ReadHistoFusSepDetQuery(
            societe, typeFusSep ?? "", chrono, positionReprise ?? "", numeroTache ?? 0));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("ReadHistoFusSepDet")
    .WithOpenApi();

    changementCompte.MapPost("/histo-fus-sep-det", async (WriteHistoFusSepDetCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("WriteHistoFusSepDet")
    .WithOpenApi();

    changementCompte.MapPost("/histo-fus-sep-saisie", async (WriteHistoFusSepSaisieCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("WriteHistoFusSepSaisie")
    .WithOpenApi();

    changementCompte.MapDelete("/histo-fus-sep-saisie/{societe}/{chrono}", async (
        string societe,
        long chrono,
        int codeCompteReference,
        int filiationReference,
        int numeroTypologie,
        int codeCompteSource,
        IMediator mediator) =>
    {
        var command = new DeleteHistoFusSepSaisieCommand(societe, chrono, codeCompteReference, filiationReference, numeroTypologie, codeCompteSource);
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("DeleteHistoFusSepSaisie")
    .WithOpenApi();

    changementCompte.MapGet("/histo-fus-sep-log/{societe}/{chrono}", async (
        string societe,
        long chrono,
        string? typeFusSep,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new ReadHistoFusSepLogQuery(societe, chrono, typeFusSep, limit));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("ReadHistoFusSepLog")
    .WithOpenApi();

    changementCompte.MapPost("/histo-fus-sep-log", async (WriteHistoFusSepLogCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("WriteHistoFusSepLog")
    .WithOpenApi();

    changementCompte.MapPost("/print", async (PrintChangementCompteCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("PrintChangementCompte")
    .WithOpenApi();

    changementCompte.MapGet("/zoom-comptes-source/{societe}", async (
        string societe,
        string? filtre,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetZoomComptesSourceQuery(societe, filtre, limit));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetZoomComptesSource")
    .WithOpenApi();

    changementCompte.MapGet("/zoom-comptes-cible/{societe}", async (
        string societe,
        int? codeAdherentSource,
        string? filtre,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetZoomComptesCibleQuery(
            societe, codeAdherentSource, filtre, limit));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetZoomComptesCible")
    .WithOpenApi();

    changementCompte.MapGet("/menu/{societe}/{codeAdherent}/{filiation}", async (
        string societe,
        int codeAdherent,
        int filiation,
        string? acces,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetMenuChangementCompteQuery(
            societe, codeAdherent, filiation, acces));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetMenuChangementCompte")
    .WithOpenApi();

    // ============ Menus Endpoints ============
    var menus = app.MapGroup("/api/menus").WithTags("Menus");

    menus.MapGet("/principal", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetMenuPrincipalQuery());
        return Results.Ok(result);
    })
    .WithName("GetMenuPrincipal")
    .WithOpenApi();

    menus.MapGet("/admin", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetMenuAdminQuery());
        return Results.Ok(result);
    })
    .WithName("GetMenuAdmin")
    .WithOpenApi();

    menus.MapGet("/caisse", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetMenuCaisseQuery());
        return Results.Ok(result);
    })
    .WithName("GetMenuCaisse")
    .WithOpenApi();

    menus.MapGet("/telephone", async (IMediator mediator) =>
    {
        var result = await mediator.Send(new GetMenuTelephoneQuery());
        return Results.Ok(result);
    })
    .WithName("GetMenuTelephone")
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

// Helper for MOP type mapping (used by facade endpoints)
static string MapMopType(string typeOperation) => typeOperation switch
{
    "CB" => "carte",
    "ES" or "ESP" => "especes",
    "CH" or "CHQ" => "cheque",
    "VI" or "VIR" => "virement",
    _ => "autre"
};

// ============ Facade DTOs (ADH Web Lot 2) ============
// Minimal records for request body deserialization

public record CreateTransactionFacadeDto(
    string? Societe,
    int CompteId,
    int Filiation,
    string? ModePaiement,
    string? Operateur,
    string? Devise,
    string? Mode,
    string? ArticleType);

public record CheckGiftPassFacadeDto(
    string Societe,
    int Compte,
    int Filiation);

public record CheckResortCreditFacadeDto(
    string Societe,
    int Compte,
    int Filiation,
    string? Service);

public record CompleteTransactionFacadeDto(
    string? Societe,
    int CodeGm,
    int Filiation,
    decimal MontantTotal,
    decimal MontantTva,
    string? DeviseTransaction,
    string? Commentaire,
    List<MopFacadeDto>? Mop);

public record RecoverTPEFacadeDto(
    List<MopFacadeDto>? NewMOP);

public record MopFacadeDto(
    string Code,
    decimal Montant);
