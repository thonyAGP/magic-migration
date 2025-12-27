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

    // ============ Dashboard ============
    app.MapGet("/", () => Results.Content(GetDashboardHtml(), "text/html"))
        .WithName("Dashboard")
        .ExcludeFromDescription();

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

static string GetDashboardHtml() => """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Caisse - Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #e0e0e0;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        header { text-align: center; margin-bottom: 3rem; }
        h1 {
            font-size: 2.5rem;
            background: linear-gradient(90deg, #00d9ff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }
        .subtitle { color: #888; font-size: 1.1rem; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        .stat-card {
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid rgba(255,255,255,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,217,255,0.2);
        }
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #00d9ff;
        }
        .stat-label { color: #888; margin-top: 0.5rem; }
        .section { margin-bottom: 2rem; }
        .section-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: #00ff88;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .endpoints { display: grid; gap: 1rem; }
        .endpoint {
            background: rgba(255,255,255,0.03);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            border-left: 4px solid #00d9ff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .endpoint:hover { background: rgba(255,255,255,0.08); }
        .method {
            background: #00d9ff;
            color: #000;
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.85rem;
        }
        .method.post { background: #00ff88; }
        .method.put { background: #ffa500; }
        .path { font-family: 'Consolas', monospace; color: #fff; }
        .desc { color: #888; font-size: 0.9rem; width: 100%; }
        .test-section {
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 2rem;
            margin-top: 2rem;
        }
        .test-form { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { color: #888; font-size: 0.9rem; }
        .form-group input, .form-group select {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(0,0,0,0.3);
            color: #fff;
            font-size: 1rem;
            width: 120px;
        }
        .form-group input:focus { outline: none; border-color: #00d9ff; }
        button {
            padding: 0.75rem 2rem;
            border-radius: 8px;
            border: none;
            background: linear-gradient(90deg, #00d9ff, #00ff88);
            color: #000;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover { transform: scale(1.05); }
        .result {
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            font-family: 'Consolas', monospace;
            white-space: pre-wrap;
            display: none;
        }
        .result.show { display: block; }
        .result.success { border-left: 4px solid #00ff88; }
        .result.error { border-left: 4px solid #ff4444; }
        .swagger-link {
            display: inline-block;
            margin-top: 1rem;
            color: #00d9ff;
            text-decoration: none;
        }
        .swagger-link:hover { text-decoration: underline; }
        footer { text-align: center; margin-top: 3rem; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🏪 API Caisse</h1>
            <p class="subtitle">Migration Magic Unipaas → C# .NET 8</p>
        </header>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">26</div>
                <div class="stat-label">Endpoints</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">11</div>
                <div class="stat-label">Tables mappées</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">116</div>
                <div class="stat-label">Tests unitaires</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">2</div>
                <div class="stat-label">Progs Ventes migrés</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📊 Ventes (Migrés depuis Magic)</h2>
            <div class="endpoints">
                <div class="endpoint">
                    <div>
                        <span class="method">GET</span>
                        <span class="path">/api/ventes/solde-giftpass/{societe}/{compte}/{filiation}</span>
                    </div>
                    <div class="desc">Prg_237 - Solde Gift Pass (somme cc_total_par_type)</div>
                </div>
                <div class="endpoint">
                    <div>
                        <span class="method">GET</span>
                        <span class="path">/api/ventes/solde-resortcredit/{societe}/{compte}/{filiation}/{service}</span>
                    </div>
                    <div class="desc">Prg_250 - Solde Resort Credit (attribué - utilisé)</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">💰 Sessions & Écarts</h2>
            <div class="endpoints">
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="path">/api/sessions/ouvrir</span>
                </div>
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span class="path">/api/sessions/fermer</span>
                </div>
                <div class="endpoint">
                    <span class="method">GET</span>
                    <span class="path">/api/ecarts/{utilisateur}/{chronoSession}</span>
                </div>
            </div>
        </div>

        <div class="test-section">
            <h2 class="section-title">🧪 Tester Solde Gift Pass</h2>
            <div class="test-form">
                <div class="form-group">
                    <label>Société</label>
                    <input type="text" id="societe" value="C" maxlength="2">
                </div>
                <div class="form-group">
                    <label>Compte</label>
                    <input type="number" id="compte" value="135795">
                </div>
                <div class="form-group">
                    <label>Filiation</label>
                    <input type="number" id="filiation" value="0">
                </div>
                <button onclick="testGiftPass()">Tester</button>
            </div>
            <div id="result" class="result"></div>
        </div>

        <a href="/swagger" class="swagger-link">📖 Voir documentation Swagger complète →</a>

        <footer>
            <p>Migration Magic Unipaas v12.03 → C# .NET 8 | CSK0912</p>
        </footer>
    </div>

    <script>
        async function testGiftPass() {
            const societe = document.getElementById('societe').value;
            const compte = document.getElementById('compte').value;
            const filiation = document.getElementById('filiation').value;
            const resultDiv = document.getElementById('result');

            try {
                const response = await fetch(`/api/ventes/solde-giftpass/${societe}/${compte}/${filiation}`);
                const data = await response.json();

                resultDiv.className = 'result show success';
                resultDiv.innerHTML = `<strong>Résultat:</strong>\n\n` +
                    `Société: ${data.societe}\n` +
                    `Compte: ${data.compte}\n` +
                    `Filiation: ${data.filiation}\n` +
                    `<span style="color:#00ff88;font-size:1.5rem">Solde: ${data.soldeCreditConso.toLocaleString('fr-FR')} €</span>\n` +
                    `Enregistrements: ${data.nombreEnregistrements}`;
            } catch (error) {
                resultDiv.className = 'result show error';
                resultDiv.textContent = 'Erreur: ' + error.message;
            }
        }
    </script>
</body>
</html>
""";
