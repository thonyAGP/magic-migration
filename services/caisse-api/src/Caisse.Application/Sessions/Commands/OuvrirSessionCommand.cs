using Caisse.Application.Common;
using Caisse.Domain.Entities;
using Caisse.Domain.ValueObjects;
using MediatR;

namespace Caisse.Application.Sessions.Commands;

/// <summary>
/// Command to open a new cash register session.
/// Creates session, initial details, and optionally coffre entry.
/// </summary>
public record OuvrirSessionCommand(
    string Utilisateur,
    string Terminal,
    string DateComptable,
    double? MontantOuverture = null,
    double? MontantCoffre = null,
    bool CreerCoffre = true) : IRequest<OuvrirSessionResult>;

public record OuvrirSessionResult(
    bool Success,
    double? ChronoSession = null,
    string? Error = null,
    OuvertureDetailsDto? Details = null);

public record OuvertureDetailsDto(
    double MontantInitial,
    double MontantCoffre,
    bool CoffreCreated,
    int NombreDetails);

public class OuvrirSessionCommandHandler : IRequestHandler<OuvrirSessionCommand, OuvrirSessionResult>
{
    private readonly ICaisseDbContext _context;

    public OuvrirSessionCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<OuvrirSessionResult> Handle(
        OuvrirSessionCommand request,
        CancellationToken cancellationToken)
    {
        // Generate new chrono (in Magic this uses a counter)
        var maxChrono = _context.Sessions
            .Where(s => s.Utilisateur == request.Utilisateur)
            .Select(s => (double?)s.Chrono)
            .Max() ?? 0;

        var newChrono = maxChrono + 1;

        var now = DateTime.Now;
        var dateStr = now.ToString("yyyyMMdd");
        var heureStr = now.ToString("HHmmss");

        // Create session
        var session = CaisseSession.Create(
            request.Utilisateur,
            newChrono,
            dateStr,
            heureStr,
            request.DateComptable);

        _context.Sessions.Add(session);

        var detailChrono = 0;
        var montantOuverture = request.MontantOuverture ?? 0;
        var montantCoffre = request.MontantCoffre ?? 0;

        // Detail 1: Initial balance (Type I = Initial, Quand O = Ouverture)
        detailChrono++;
        var detailInitial = CaisseSessionDetail.Create(
            request.Utilisateur,
            newChrono,
            detailChrono,
            TypesMouvements.Initial,
            MomentOperation.Ouverture,
            dateStr,
            heureStr);
        detailInitial.SetMontants(montant: montantOuverture, monnaie: montantOuverture);
        _context.SessionDetails.Add(detailInitial);

        // Detail 2: Counting at opening (Type C = Comptage, Quand O = Ouverture)
        detailChrono++;
        var detailComptage = CaisseSessionDetail.Create(
            request.Utilisateur,
            newChrono,
            detailChrono,
            TypesMouvements.Comptage,
            MomentOperation.Ouverture,
            dateStr,
            heureStr);
        detailComptage.SetMontants(montant: montantOuverture, monnaie: montantOuverture);
        _context.SessionDetails.Add(detailComptage);

        // Detail 3: Coffre at opening if amount provided (Type K = Coffre, Quand O = Ouverture)
        var coffreCreated = false;
        if (montantCoffre > 0 || request.CreerCoffre)
        {
            detailChrono++;
            var detailCoffre = CaisseSessionDetail.Create(
                request.Utilisateur,
                newChrono,
                detailChrono,
                TypesMouvements.CoffretVers,
                MomentOperation.Ouverture,
                dateStr,
                heureStr);
            detailCoffre.SetMontants(montant: montantCoffre, monnaie: montantCoffre);
            _context.SessionDetails.Add(detailCoffre);

            // Create coffre entry
            var coffre = CaisseSessionCoffre2.Create(
                request.Utilisateur,
                newChrono,
                dateStr,
                heureStr);
            _context.SessionCoffres.Add(coffre);
            coffreCreated = true;
        }

        // Detail 4: Coffre withdrawal if needed (Type L = Levée, Quand O = Ouverture)
        // This represents money taken from safe to start the register
        if (montantCoffre > 0)
        {
            detailChrono++;
            var detailLevee = CaisseSessionDetail.Create(
                request.Utilisateur,
                newChrono,
                detailChrono,
                TypesMouvements.CoffretLeve,
                MomentOperation.Ouverture,
                dateStr,
                heureStr);
            detailLevee.SetMontants(montant: montantCoffre, monnaie: montantCoffre);
            _context.SessionDetails.Add(detailLevee);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var details = new OuvertureDetailsDto(
            montantOuverture,
            montantCoffre,
            coffreCreated,
            detailChrono);

        return new OuvrirSessionResult(true, newChrono, Details: details);
    }
}
