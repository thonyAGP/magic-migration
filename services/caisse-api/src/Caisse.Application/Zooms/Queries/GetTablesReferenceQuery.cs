using Caisse.Application.Common;
using Caisse.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Zooms.Queries;

/// <summary>
/// Query to get reference table entries by table name
/// Table: cafil045_dat (tables___________tab)
/// Used for services, articles, operators lookups
/// </summary>
public record GetTablesReferenceQuery(string NomTable) : IRequest<List<TableReference>>;

public class GetTablesReferenceQueryHandler : IRequestHandler<GetTablesReferenceQuery, List<TableReference>>
{
    private readonly ICaisseDbContext _context;

    public GetTablesReferenceQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<List<TableReference>> Handle(
        GetTablesReferenceQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.TablesReference
            .Where(t => t.NomTable == request.NomTable)
            .OrderBy(t => t.CodeAlpha5)
            .ToListAsync(cancellationToken);
    }
}
