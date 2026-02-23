using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.DevisesRef.Queries;

public record GetAllDevisesRefQuery() : IRequest<List<DeviseRefDto>>;

public record DeviseRefDto(
    string CodeDevise,
    string Libelle,
    int NombreDeDecimales,
    double Taux);

public class GetAllDevisesRefQueryHandler : IRequestHandler<GetAllDevisesRefQuery, List<DeviseRefDto>>
{
    private readonly ICaisseDbContext _context;

    public GetAllDevisesRefQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<DeviseRefDto>> Handle(
        GetAllDevisesRefQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.DeviseReferences
            .OrderBy(d => d.CodeDevise)
            .Select(d => new DeviseRefDto(
                d.CodeDevise,
                d.Libelle,
                d.NombreDeDecimales,
                d.Taux))
            .ToListAsync(cancellationToken);
    }
}
