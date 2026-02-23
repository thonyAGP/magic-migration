using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Details.Queries;

public record GetSessionDetailsQuery(
    string Utilisateur,
    double ChronoSession,
    string? Type = null,
    string? Quand = null) : IRequest<List<SessionDetailDto>>;

public record SessionDetailDto(
    int ChronoDetail,
    string Type,
    string Quand,
    string Date,
    string Heure,
    double? Montant,
    double? MontantMonnaie,
    double? MontantProduits,
    double? MontantCartes,
    double? MontantCheques,
    double? MontantOd,
    string? CommentaireEcart,
    string TerminalCaisse);

public class GetSessionDetailsQueryHandler : IRequestHandler<GetSessionDetailsQuery, List<SessionDetailDto>>
{
    private readonly ICaisseDbContext _context;

    public GetSessionDetailsQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<SessionDetailDto>> Handle(
        GetSessionDetailsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.SessionDetails
            .Where(d => d.Utilisateur == request.Utilisateur
                     && d.ChronoSession == request.ChronoSession);

        if (!string.IsNullOrEmpty(request.Type))
            query = query.Where(d => d.Type == request.Type);

        if (!string.IsNullOrEmpty(request.Quand))
            query = query.Where(d => d.Quand == request.Quand);

        return await query
            .OrderBy(d => d.ChronoDetail)
            .Select(d => new SessionDetailDto(
                d.ChronoDetail,
                d.Type,
                d.Quand,
                d.Date,
                d.Heure,
                d.Montant,
                d.MontantMonnaie,
                d.MontantProduits,
                d.MontantCartes,
                d.MontantCheques,
                d.MontantOd,
                d.CommentaireEcart,
                d.TerminalCaisse))
            .ToListAsync(cancellationToken);
    }
}
