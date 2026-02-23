using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to retrieve gratuity/complimentary codes for selection.
/// Migrated from Magic Prg_252 "Zoom sur table des gratuites"
/// </summary>
public record GetZoomGratuitesQuery(
    string Societe,
    string? SearchTerm = null,
    int Limit = 100) : IRequest<GetZoomGratuitesResult>;

public record GetZoomGratuitesResult
{
    public bool Found { get; init; }
    public int TotalCount { get; init; }
    public List<GratuitZoomDto> Gratuits { get; init; } = new();
}

public record GratuitZoomDto
{
    public string CodeGratuit { get; init; } = string.Empty;
    public string LibelleGratuit { get; init; } = string.Empty;
    public string DescriptionGratuit { get; init; } = string.Empty;
    public bool Actif { get; init; }
    public string TypeGratuit { get; init; } = string.Empty;
}

public class GetZoomGratuitesQueryValidator : AbstractValidator<GetZoomGratuitesQuery>
{
    public GetZoomGratuitesQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 500).WithMessage("Limit must be between 1 and 500");
    }
}

public class GetZoomGratuitesQueryHandler : IRequestHandler<GetZoomGratuitesQuery, GetZoomGratuitesResult>
{
    public GetZoomGratuitesQueryHandler()
    {
    }

    public async Task<GetZoomGratuitesResult> Handle(
        GetZoomGratuitesQuery request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Query gratuity codes from reference table filtered by societe
        // 2. Apply search filter if provided
        // 3. Filter for active codes only
        // 4. Sort by code_gratuit
        // 5. Limit results
        // 6. Return for dropdown selection

        // Placeholder implementation
        return await Task.FromResult(new GetZoomGratuitesResult
        {
            Found = false,
            TotalCount = 0,
            Gratuits = new()
        });
    }
}
