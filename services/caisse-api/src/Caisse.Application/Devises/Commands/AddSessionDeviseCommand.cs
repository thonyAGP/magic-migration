using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Devises.Commands;

public record AddSessionDeviseCommand(
    string Utilisateur,
    double ChronoSession,
    string Type,
    string Quand,
    string CodeDevise,
    string ModePaiement,
    double Quantite) : IRequest<AddSessionDeviseResult>;

public record AddSessionDeviseResult(
    bool Success,
    int? ChronoDetail = null,
    string? Error = null);

public class AddSessionDeviseCommandHandler : IRequestHandler<AddSessionDeviseCommand, AddSessionDeviseResult>
{
    private readonly ICaisseDbContext _context;

    public AddSessionDeviseCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<AddSessionDeviseResult> Handle(
        AddSessionDeviseCommand request,
        CancellationToken cancellationToken)
    {
        // Verify session exists
        var sessionExists = await _context.Sessions
            .AnyAsync(s => s.Utilisateur == request.Utilisateur
                        && s.Chrono == request.ChronoSession,
                cancellationToken);

        if (!sessionExists)
            return new AddSessionDeviseResult(false, Error: "Session non trouvée");

        // Get next chrono_detail
        var maxDetail = await _context.SessionDevises
            .Where(d => d.Utilisateur == request.Utilisateur
                     && d.ChronoSession == request.ChronoSession)
            .Select(d => (int?)d.ChronoDetail)
            .MaxAsync(cancellationToken) ?? 0;

        var newDetail = maxDetail + 1;

        var now = DateTime.Now;
        var dateStr = now.ToString("yyyyMMdd");
        var heureStr = now.ToString("HHmmss");

        var devise = CaisseSessionDevise.Create(
            request.Utilisateur,
            request.ChronoSession,
            newDetail,
            request.Type,
            request.Quand,
            request.CodeDevise,
            request.ModePaiement,
            request.Quantite,
            dateStr,
            heureStr);

        _context.SessionDevises.Add(devise);
        await _context.SaveChangesAsync(cancellationToken);

        return new AddSessionDeviseResult(true, newDetail);
    }
}
