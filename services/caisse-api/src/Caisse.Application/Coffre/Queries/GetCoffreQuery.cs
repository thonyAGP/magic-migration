using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Coffre.Queries;

public record GetCoffreQuery(
    string? Utilisateur = null,
    int? Limit = 20) : IRequest<List<CoffreDto>>;

public record CoffreDto(
    string Utilisateur,
    double Chrono,
    string DateOuvertureCaisse90,
    string HeureOuvertureCaisse90);

public class GetCoffreQueryHandler : IRequestHandler<GetCoffreQuery, List<CoffreDto>>
{
    private readonly ICaisseDbContext _context;

    public GetCoffreQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<CoffreDto>> Handle(
        GetCoffreQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.SessionCoffres.AsQueryable();

        if (!string.IsNullOrEmpty(request.Utilisateur))
            query = query.Where(c => c.Utilisateur == request.Utilisateur);

        return await query
            .OrderByDescending(c => c.Chrono)
            .Take(request.Limit ?? 20)
            .Select(c => new CoffreDto(
                c.Utilisateur,
                c.Chrono,
                c.DateOuvertureCaisse90,
                c.HeureOuvertureCaisse90))
            .ToListAsync(cancellationToken);
    }
}
