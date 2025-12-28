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
using Caisse.Application.Ecarts.Queries;
using Caisse.Application.Ventes.Queries;
using Caisse.Application.EasyCheckOut.Commands;
using Caisse.Application.EasyCheckOut.Queries;
using Caisse.Application.Zooms.Queries;
using Caisse.Application.Members.Queries;
using Caisse.Application.Solde.Queries;
using Caisse.Application.Extrait.Queries;
using Caisse.Application.Garanties.Queries;
using Caisse.Application.Change.Queries;
using Caisse.Application.Telephone.Queries;
using Caisse.Application.Telephone.Commands;
using Caisse.Application.Factures.Queries;
using Caisse.Application.Factures.Commands;
using Caisse.Application.Identification.Queries;
using Caisse.Application.EzCard.Queries;
using Caisse.Application.EzCard.Commands;
using Caisse.Application.Depot.Queries;
using Caisse.Application.Depot.Commands;
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

    // Serve static files and default document (index.html)
    app.UseDefaultFiles();
    app.UseStaticFiles();

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
    .WithSummary("Calculate the discrepancy (écart) for a session")
    .WithDescription("Returns detailed breakdown of expected vs counted amounts, including by currency/payment mode")
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
    .WithSummary("Get total Gift Pass balance for a client")
    .WithDescription("Migrated from Magic Prg_237 - Sums solde_credit_conso from cc_total_par_type table")
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
    .WithSummary("Get Resort Credit balance for a client/service")
    .WithDescription("Migrated from Magic Prg_250 - Calculates IF(attribue > utilise, attribue - utilise, 0)")
    .WithOpenApi();

    // ============ EasyCheckOut Endpoints ============
    var checkout = app.MapGroup("/api/easycheckout").WithTags("EasyCheckOut");

    checkout.MapPost("/solde", async (SoldeEasyCheckOutCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.TransactionValidee ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("SoldeEasyCheckOut")
    .WithSummary("Execute Easy Check Out balance calculation")
    .WithDescription("Migrated from Magic Prg_64 SOLDE_EASY_CHECK_OUT - Complete checkout process with PDF generation")
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
    .WithSummary("Generate Easy Check Out edition and email")
    .WithDescription("Migrated from Magic Prg_65 EDITION_EASY_CHECK_OUT - Generates PDF and sends email to clients")
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
    .WithSummary("Get Easy Check Out extract for next day departures")
    .WithDescription("Migrated from Magic Prg_53 EXTRAIT_EASY_CHECKOUT - Generates account extract for J+1 departures")
    .WithOpenApi();

    // ============ Zooms Endpoints (Phase 1) ============
    var zooms = app.MapGroup("/api/zooms").WithTags("Zooms");

    zooms.MapGet("/moyens-reglement/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetMoyensReglementQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetMoyensReglement")
    .WithSummary("Get payment methods for a company")
    .WithOpenApi();

    zooms.MapGet("/tables/{nomTable}", async (string nomTable, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetTablesReferenceQuery(nomTable));
        return Results.Ok(result);
    })
    .WithName("GetTablesReference")
    .WithSummary("Get reference table entries (services, articles, etc.)")
    .WithOpenApi();

    zooms.MapGet("/devises/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDevisesZoomQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetDevisesZoom")
    .WithSummary("Get currencies for a company")
    .WithOpenApi();

    zooms.MapGet("/garanties/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetGarantiesQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetGaranties")
    .WithSummary("Get guarantee types for a company")
    .WithOpenApi();

    zooms.MapGet("/depots-objets/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDepotsObjetsQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetDepotsObjets")
    .WithSummary("Get deposit object types for a company")
    .WithOpenApi();

    zooms.MapGet("/depots-devises/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDepotsDevisesQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetDepotsDevises")
    .WithSummary("Get deposit currencies for a company")
    .WithOpenApi();

    zooms.MapGet("/pays", async (string? codeLangue, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetPaysQuery(codeLangue));
        return Results.Ok(result);
    })
    .WithName("GetPays")
    .WithSummary("Get countries/nationalities")
    .WithOpenApi();

    zooms.MapGet("/types-taux-change/{societe}", async (string societe, IMediator mediator) =>
    {
        var result = await mediator.Send(new GetTypesTauxChangeQuery(societe));
        return Results.Ok(result);
    })
    .WithName("GetTypesTauxChange")
    .WithSummary("Get exchange rate types for a company")
    .WithOpenApi();

    // ============ Members Endpoints (Phase 2) ============
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
    .WithSummary("Get Club Med Pass (EzCard) for a member")
    .WithDescription("Migrated from Magic Prg_160 GetCMP - Returns card_code from ez_card table if status is not in Opposition")
    .WithOpenApi();

    // ============ Solde Endpoints (Phase 3) ============
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
    .WithSummary("Get account balance details")
    .WithDescription("Migrated from Magic Prg_192 SOLDE_COMPTE - Complete balance with deposits, sales, guarantees")
    .WithOpenApi();

    // ============ Ventes Historique Endpoints (Phase 4) ============
    ventes.MapGet("/historique/{societe}/{codeGm}/{filiation}", async (
        string societe,
        int codeGm,
        int filiation,
        DateOnly? dateDebut,
        DateOnly? dateFin,
        int? limit,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetHistoVentesQuery(societe, codeGm, filiation, dateDebut, dateFin, limit ?? 50));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetHistoVentes")
    .WithSummary("Get sales history for an account")
    .WithDescription("Migrated from Magic Prg_239-241 Histo ventes payantes - Transaction history with details")
    .WithOpenApi();

    // ============ Extrait Endpoints (Phase 5) ============
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
    .WithSummary("Generate account statement")
    .WithDescription("Migrated from Magic Prg_69 EXTRAIT_COMPTE - Account statement with sorting and service filter")
    .WithOpenApi();

    // ============ Garanties Endpoints (Phase 6) ============
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
    .WithSummary("Get account guarantees/deposits")
    .WithDescription("Migrated from Magic Prg_111 GARANTIE - Account guarantee deposits with available types")
    .WithOpenApi();

    // ============ Change Endpoints (Phase 7) ============
    var change = app.MapGroup("/api/change").WithTags("Change");

    change.MapGet("/devise-locale/{societe}", async (
        string societe,
        IMediator mediator) =>
    {
        var result = await mediator.Send(new GetDeviseLocaleQuery(societe));
        return result.Found ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("GetDeviseLocale")
    .WithSummary("Get local currency for a company")
    .WithDescription("Migrated from Magic Prg_21 - Returns the local/base currency")
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
    .WithSummary("Get exchange rates for a company")
    .WithDescription("Migrated from Magic Prg_20 - List of available exchange rates")
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
    .WithSummary("Calculate currency equivalent")
    .WithDescription("Migrated from Magic Prg_22 - Currency conversion with exchange rates")
    .WithOpenApi();

    // ============ Telephone Endpoints (Phase 8) ============
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
    .WithSummary("Get phone lines for an account")
    .WithDescription("Migrated from Magic Prg_202 - Read autocom codes for a guest")
    .WithOpenApi();

    telephone.MapPost("/gerer", async (GererLigneTelephoneCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("GererLigneTelephone")
    .WithSummary("Open or close a phone line")
    .WithDescription("Migrated from Magic Prg_208/210 - OPEN_PHONE_LINE / CLOSE_PHONE_LINE")
    .WithOpenApi();

    // ============ Factures Endpoints (Phase 10) ============
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
    .WithSummary("Get checkout invoices for an account")
    .WithDescription("Migrated from Magic Prg_54 FACTURES_CHECK_OUT - Invoices for checkout process")
    .WithOpenApi();

    factures.MapPost("/creer", async (CreerFactureCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreerFacture")
    .WithSummary("Create a new VAT invoice")
    .WithDescription("Migrated from Magic Prg_97 Saisie_facture_tva V3 - Create invoice with TVA calculation")
    .WithOpenApi();

    // ============ Identification Endpoints (Phase 11) ============
    var identification = app.MapGroup("/api/identification").WithTags("Identification");

    identification.MapPost("/verifier", async (VerifierOperateurQuery query, IMediator mediator) =>
    {
        var result = await mediator.Send(query);
        return result.Authentifie ? Results.Ok(result) : Results.Unauthorized();
    })
    .WithName("VerifierOperateur")
    .WithSummary("Verify operator credentials")
    .WithDescription("Migrated from Magic Prg_158 Selection Identification - Login verification")
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
    .WithSummary("Check if a cash session is open")
    .WithDescription("Migrated from Magic Prg_328 Verif session caisse ouverte - Session status check")
    .WithOpenApi();

    // ============ EzCard Endpoints (Phase 12 - Secondary modules) ============
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
    .WithSummary("Get all EzCards for a member")
    .WithDescription("Migrated from Magic Prg_80 Card scan read - Reads all cards for a member with status")
    .WithOpenApi();

    ezcard.MapPost("/desactiver", async (DesactiverEzCardCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("DesactiverEzCard")
    .WithSummary("Deactivate an EzCard")
    .WithDescription("Migrated from Magic Prg_83 Deactivate all cards - Sets card status to D (Deactivated)")
    .WithOpenApi();

    ezcard.MapPost("/valider-caracteres", async (ValiderCaracteresQuery query, IMediator mediator) =>
    {
        var result = await mediator.Send(query);
        return Results.Ok(result);
    })
    .WithName("ValiderCaracteres")
    .WithSummary("Validate and clean forbidden characters in text")
    .WithDescription("Migrated from Magic Prg_84 CARACT_INTERDIT - Returns cleaned text and list of detected forbidden characters")
    .WithOpenApi();

    // ============ Depot Endpoints (Phase 12 - Secondary modules) ============
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
    .WithSummary("Get deposit extract for a member")
    .WithDescription("Migrated from Magic Prg_39 Print extrait ObjDevSce - Returns all deposits (objects, currencies, sealed)")
    .WithOpenApi();

    depot.MapPost("/retirer", async (RetirerDepotCommand command, IMediator mediator) =>
    {
        var result = await mediator.Send(command);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("RetirerDepot")
    .WithSummary("Withdraw a deposit")
    .WithDescription("Migrated from Magic Prg_40 Comptes de depot - Marks a deposit as withdrawn")
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
