using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Coffre.Queries;

public record GetCoffreBySessionQuery(
    string Utilisateur,
    double Chrono) : IRequest<CoffreDto?>;

public class GetCoffreBySessionQueryHandler : IRequestHandler<GetCoffreBySessionQuery, CoffreDto?>
{
    private readonly ICaisseDbContext _context;

    public GetCoffreBySessionQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<CoffreDto?> Handle(
        GetCoffreBySessionQuery request,
        CancellationToken cancellationToken)
    {
        var coffre = await _context.SessionCoffres
            .FirstOrDefaultAsync(c => c.Utilisateur == request.Utilisateur
                                   && c.Chrono == request.Chrono,
                cancellationToken);

        if (coffre == null)
            return null;

        return new CoffreDto(
            coffre.Utilisateur,
            coffre.Chrono,
            coffre.DateOuvertureCaisse90,
            coffre.HeureOuvertureCaisse90);
    }
}
