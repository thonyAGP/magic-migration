using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Sessions.Commands;

public record FermerSessionCommand(
    string Utilisateur,
    double ChronoSession,
    double? MontantCompteCaisse = null,
    double? MontantEcart = null,
    string? CommentaireEcart = null) : IRequest<FermerSessionResult>;

public record FermerSessionResult(
    bool Success,
    double? Ecart = null,
    string? Error = null);

public class FermerSessionCommandHandler : IRequestHandler<FermerSessionCommand, FermerSessionResult>
{
    private readonly ICaisseDbContext _context;

    public FermerSessionCommandHandler(ICaisseDbContext context)
    {
        _context = context;
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

        session.Fermer(dateStr, heureStr);

        // Get next detail chrono
        var maxDetail = await _context.SessionDetails
            .Where(d => d.Utilisateur == request.Utilisateur && d.ChronoSession == request.ChronoSession)
            .Select(d => (int?)d.ChronoDetail)
            .MaxAsync(cancellationToken) ?? 0;

        // Create closing detail - Type "F" for Fermeture, Quand "F" for Fin
        var detail = CaisseSessionDetail.Create(
            request.Utilisateur,
            request.ChronoSession,
            maxDetail + 1,
            "F", // Fermeture (1 char)
            "F", // Fin (1 char)
            dateStr,
            heureStr);

        if (request.MontantCompteCaisse.HasValue)
        {
            detail.SetMontants(montant: request.MontantCompteCaisse);
        }

        if (!string.IsNullOrEmpty(request.CommentaireEcart))
        {
            detail.SetEcart(request.CommentaireEcart);
        }

        _context.SessionDetails.Add(detail);

        await _context.SaveChangesAsync(cancellationToken);

        return new FermerSessionResult(true, request.MontantEcart);
    }
}
