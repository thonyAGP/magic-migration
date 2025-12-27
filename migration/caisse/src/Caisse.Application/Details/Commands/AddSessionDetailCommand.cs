using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Details.Commands;

public record AddSessionDetailCommand(
    string Utilisateur,
    double ChronoSession,
    string Type,
    string Quand,
    double? Montant = null,
    double? MontantMonnaie = null,
    double? MontantProduits = null,
    double? MontantCartes = null,
    double? MontantCheques = null,
    double? MontantOd = null,
    string? CommentaireEcart = null,
    string? TerminalCaisse = null) : IRequest<AddSessionDetailResult>;

public record AddSessionDetailResult(
    bool Success,
    int? ChronoDetail = null,
    string? Error = null);

public class AddSessionDetailCommandHandler : IRequestHandler<AddSessionDetailCommand, AddSessionDetailResult>
{
    private readonly ICaisseDbContext _context;

    public AddSessionDetailCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<AddSessionDetailResult> Handle(
        AddSessionDetailCommand request,
        CancellationToken cancellationToken)
    {
        // Verify session exists
        var sessionExists = await _context.Sessions
            .AnyAsync(s => s.Utilisateur == request.Utilisateur
                        && s.Chrono == request.ChronoSession,
                cancellationToken);

        if (!sessionExists)
            return new AddSessionDetailResult(false, Error: "Session non trouvee");

        // Get next chrono_detail
        var maxDetail = await _context.SessionDetails
            .Where(d => d.Utilisateur == request.Utilisateur
                     && d.ChronoSession == request.ChronoSession)
            .Select(d => (int?)d.ChronoDetail)
            .MaxAsync(cancellationToken) ?? 0;

        var newDetail = maxDetail + 1;

        var now = DateTime.Now;
        var dateStr = now.ToString("yyyyMMdd");
        var heureStr = now.ToString("HHmmss");

        var detail = CaisseSessionDetail.Create(
            request.Utilisateur,
            request.ChronoSession,
            newDetail,
            request.Type,
            request.Quand,
            dateStr,
            heureStr);

        detail.SetMontants(
            request.Montant,
            request.MontantMonnaie,
            request.MontantProduits,
            request.MontantCartes,
            request.MontantCheques,
            request.MontantOd);

        if (!string.IsNullOrEmpty(request.CommentaireEcart))
            detail.SetEcart(request.CommentaireEcart);

        _context.SessionDetails.Add(detail);
        await _context.SaveChangesAsync(cancellationToken);

        return new AddSessionDetailResult(true, newDetail);
    }
}
