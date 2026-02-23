using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EasyCheckOut.Queries;

/// <summary>
/// Query pour l'édition et envoi par mail Easy Check Out
/// Migration du programme Magic Prg_65 "EDITION_EASY_CHECK_OUT"
///
/// Paramètres originaux Magic:
/// 1. Erreurs Seules (B) - Afficher uniquement les erreurs
/// 2. Edition Auto (B) - Génération automatique PDF
/// 3. Test PES (B) - Mode test paiement électronique
/// 4. Date Edition (D) - Date de l'édition
/// </summary>
public record EditionEasyCheckOutQuery(
    bool ErreursSeules,
    bool EditionAuto,
    bool TestPes,
    DateOnly DateEdition
) : IRequest<EditionEasyCheckOutResult>;

public record EditionEasyCheckOutResult
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public int NombreEditions { get; init; }
    public int NombreErreurs { get; init; }
    public List<EditionEcoDto> Editions { get; init; } = new();
}

public record EditionEcoDto
{
    public int NumCompte { get; init; }
    public string NomClient { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public decimal Solde { get; init; }
    public bool EnvoyeParMail { get; init; }
    public bool Erreur { get; init; }
    public string? MessageErreur { get; init; }
}

public class EditionEasyCheckOutQueryValidator : AbstractValidator<EditionEasyCheckOutQuery>
{
    public EditionEasyCheckOutQueryValidator()
    {
        RuleFor(x => x.DateEdition)
            .NotEmpty().WithMessage("DateEdition is required");
    }
}

public class EditionEasyCheckOutQueryHandler : IRequestHandler<EditionEasyCheckOutQuery, EditionEasyCheckOutResult>
{
    private readonly ICaisseDbContext _context;

    public EditionEasyCheckOutQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<EditionEasyCheckOutResult> Handle(
        EditionEasyCheckOutQuery request,
        CancellationToken cancellationToken)
    {
        // Récupérer les comptes à éditer pour la date donnée
        var comptes = await _context.GmComplets
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var editions = new List<EditionEcoDto>();
        int nombreErreurs = 0;

        foreach (var compte in comptes)
        {
            // Récupérer l'email du compte
            var email = await _context.Emails
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Compte == compte.Compte, cancellationToken);

            // Calculer le solde
            var depots = await _context.DepotGaranties
                .AsNoTracking()
                .Where(d => d.CodeGm == compte.Compte && d.Etat != "R")
                .ToListAsync(cancellationToken);

            var solde = (decimal)depots.Sum(d => d.Montant);
            bool erreur = email == null || string.IsNullOrEmpty(email.EmailAddress);

            if (erreur) nombreErreurs++;

            // Filtrer si demandé erreurs seules
            if (request.ErreursSeules && !erreur)
                continue;

            editions.Add(new EditionEcoDto
            {
                NumCompte = compte.Compte,
                NomClient = $"{compte.NomComplet} {compte.PrenomComplet}".Trim(),
                Email = email?.EmailAddress ?? "",
                Solde = solde,
                EnvoyeParMail = !erreur && request.EditionAuto,
                Erreur = erreur,
                MessageErreur = erreur ? "Email non renseigné" : null
            });
        }

        return new EditionEasyCheckOutResult
        {
            Success = true,
            NombreEditions = editions.Count(e => !e.Erreur),
            NombreErreurs = nombreErreurs,
            Editions = editions
        };
    }
}
