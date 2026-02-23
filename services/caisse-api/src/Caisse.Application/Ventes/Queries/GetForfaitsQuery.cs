using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to get available forfaits by article type.
/// Used by ADH Web Lot 2 facade: GET /api/forfaits?articleType=X
/// </summary>
public record GetForfaitsQuery(string? ArticleType = null) : IRequest<GetForfaitsResult>;

public record GetForfaitsResult
{
    public bool Found { get; init; }
    public int TotalCount { get; init; }
    public List<ForfaitDto> Forfaits { get; init; } = new();
}

public record ForfaitDto
{
    public string Code { get; init; } = string.Empty;
    public string Libelle { get; init; } = string.Empty;
    public string DateDebut { get; init; } = string.Empty;
    public string DateFin { get; init; } = string.Empty;
    public string ArticleType { get; init; } = string.Empty;
    public decimal PrixParJour { get; init; }
    public decimal PrixForfait { get; init; }
}

public class GetForfaitsQueryValidator : AbstractValidator<GetForfaitsQuery>
{
    public GetForfaitsQueryValidator()
    {
        RuleFor(x => x.ArticleType)
            .MaximumLength(50).When(x => x.ArticleType != null)
            .WithMessage("ArticleType must be at most 50 characters");
    }
}

public class GetForfaitsQueryHandler : IRequestHandler<GetForfaitsQuery, GetForfaitsResult>
{
    public async Task<GetForfaitsResult> Handle(
        GetForfaitsQuery request,
        CancellationToken cancellationToken)
    {
        // TODO: Query forfaits from database filtered by articleType
        // Stub: return empty list for now
        return await Task.FromResult(new GetForfaitsResult
        {
            Found = false,
            TotalCount = 0,
            Forfaits = new()
        });
    }
}
