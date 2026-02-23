using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.DevisesRef.Queries;

public record GetDeviseRefQuery(string CodeDevise) : IRequest<DeviseRefDto?>;

public class GetDeviseRefQueryHandler : IRequestHandler<GetDeviseRefQuery, DeviseRefDto?>
{
    private readonly ICaisseDbContext _context;

    public GetDeviseRefQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<DeviseRefDto?> Handle(
        GetDeviseRefQuery request,
        CancellationToken cancellationToken)
    {
        var devise = await _context.DeviseReferences
            .FirstOrDefaultAsync(d => d.CodeDevise == request.CodeDevise,
                cancellationToken);

        if (devise == null)
            return null;

        return new DeviseRefDto(
            devise.CodeDevise,
            devise.Libelle,
            devise.NombreDeDecimales,
            devise.Taux);
    }
}
