using Caisse.Application.Common;
using Caisse.Domain.Entities;
using Caisse.Domain.Services;
using Caisse.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Sessions.Commands;

public record FermerSessionCommand(
    string Utilisateur,
    double ChronoSession,
    double? MontantCompteCaisse = null,
    string? CommentaireEcart = null,
    bool ForceClosureOnEcart = false,
    double SeuilAlerte = 100) : IRequest<FermerSessionResult>;

public record FermerSessionResult(
    bool Success,
    string? Error = null,
    EcartResultDto? Ecart = null);

public record EcartResultDto(
    double Attendu,
    double Compte,
    double Ecart,
    bool EstEquilibre,
    EcartStatutDto Statut,
    List<EcartDeviseDto> EcartsDevises);

public record EcartDeviseDto(
    string CodeDevise,
    string ModePaiement,
    double Attendu,
    double Compte,
    double Ecart);

public enum EcartStatutDto
{
    Equilibre,
    EcartPositif,   // Surplus
    EcartNegatif,   // Shortage
    AlerteSeuil     // Exceeds threshold
}

public class FermerSessionCommandHandler : IRequestHandler<FermerSessionCommand, FermerSessionResult>
{
    private readonly ICaisseDbContext _context;
    private readonly IEcartCalculator _ecartCalculator;

    public FermerSessionCommandHandler(ICaisseDbContext context, IEcartCalculator ecartCalculator)
    {
        _context = context;
        _ecartCalculator = ecartCalculator;
    }

    public async Task<FermerSessionResult> Handle(
        FermerSessionCommand request,
        CancellationToken cancellationToken)
    {
        var session = await _context.Sessions
            .FirstOrDefaultAsync(
                s => s.Utilisateur == request.Utilisateur && s.Chrono == request.ChronoSession,
                cancellationToken);

        if (session == null)
            return new FermerSessionResult(false, Error: "Session non trouvée");

        if (!session.EstOuverte)
            return new FermerSessionResult(false, Error: "Session déjà fermée");

        var now = DateTime.Now;
        var dateStr = now.ToString("yyyyMMdd");
        var heureStr = now.ToString("HHmmss");

        // Get existing details and devises for écart calculation
        var existingDetails = await _context.SessionDetails
            .Where(d => d.Utilisateur == request.Utilisateur && d.ChronoSession == request.ChronoSession)
            .ToListAsync(cancellationToken);

        var existingDevises = await _context.SessionDevises
            .Where(d => d.Utilisateur == request.Utilisateur && d.ChronoSession == request.ChronoSession)
            .ToListAsync(cancellationToken);

        // Get next detail chrono
        var maxDetail = existingDetails.Count > 0
            ? existingDetails.Max(d => d.ChronoDetail)
            : 0;

        // Create closing detail with counted amount
        var closingDetail = CaisseSessionDetail.Create(
            request.Utilisateur,
            request.ChronoSession,
            maxDetail + 1,
            TypesMouvements.Comptage,
            MomentOperation.Fermeture,
            dateStr,
            heureStr);

        if (request.MontantCompteCaisse.HasValue)
        {
            closingDetail.SetMontants(montant: request.MontantCompteCaisse, monnaie: request.MontantCompteCaisse);
        }

        // Add closing detail to list for écart calculation
        var allDetails = existingDetails.Concat([closingDetail]).ToList();

        // Calculate écart
        var ecartSession = _ecartCalculator.Calculer(allDetails, existingDevises);

        // Determine status and check threshold
        var ecartAbsolu = Math.Abs(ecartSession.Ecart.Total);
        var depasseSeuil = ecartAbsolu > request.SeuilAlerte;

        var statut = ecartSession.EstEquilibre
            ? EcartStatutDto.Equilibre
            : depasseSeuil
                ? EcartStatutDto.AlerteSeuil
                : ecartSession.Ecart.Total > 0
                    ? EcartStatutDto.EcartPositif
                    : EcartStatutDto.EcartNegatif;

        var ecartResult = new EcartResultDto(
            ecartSession.Attendu.Total,
            ecartSession.Compte.Total,
            ecartSession.Ecart.Total,
            ecartSession.EstEquilibre,
            statut,
            ecartSession.EcartsDevises.Select(e => new EcartDeviseDto(
                e.CodeDevise, e.ModePaiement, e.Attendu, e.Compte, e.Ecart)).ToList());

        // Block closure if écart exceeds threshold and not forced
        if (depasseSeuil && !request.ForceClosureOnEcart)
        {
            return new FermerSessionResult(
                false,
                Error: $"Écart de {ecartSession.Ecart.Total:N2} dépasse le seuil de {request.SeuilAlerte:N2}. " +
                       $"Utilisez ForceClosureOnEcart=true pour forcer la fermeture.",
                Ecart: ecartResult);
        }

        // Set comment if écart exists
        if (!ecartSession.EstEquilibre)
        {
            var comment = request.CommentaireEcart
                ?? $"Écart automatique: {ecartSession.Ecart.Total:N2}";
            closingDetail.SetEcart(comment);
        }

        // Persist changes
        session.Fermer(dateStr, heureStr);
        _context.SessionDetails.Add(closingDetail);
        await _context.SaveChangesAsync(cancellationToken);

        return new FermerSessionResult(true, Ecart: ecartResult);
    }
}
