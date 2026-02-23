using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to retrieve articles for sale (zoom/lookup).
/// Migrated from Magic Prg_253 "Zoom articles"
/// </summary>
public record GetZoomArticlesQuery(
    string Societe,
    string? SearchTerm = null,
    int Limit = 50) : IRequest<GetZoomArticlesResult>;

public record GetZoomArticlesResult
{
    public bool Found { get; init; }
    public int TotalCount { get; init; }
    public List<ArticleZoomDto> Articles { get; init; } = new();
}

public record ArticleZoomDto
{
    public string CodeArticle { get; init; } = string.Empty;
    public string LibelleArticle { get; init; } = string.Empty;
    public string DescriptionArticle { get; init; } = string.Empty;
    public decimal PrixUnitaire { get; init; }
    public string Devise { get; init; } = string.Empty;
    public bool Actif { get; init; }
    public string CodeCategorie { get; init; } = string.Empty;
}

public class GetZoomArticlesQueryValidator : AbstractValidator<GetZoomArticlesQuery>
{
    public GetZoomArticlesQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 500).WithMessage("Limit must be between 1 and 500");
    }
}

public class GetZoomArticlesQueryHandler : IRequestHandler<GetZoomArticlesQuery, GetZoomArticlesResult>
{
    public GetZoomArticlesQueryHandler()
    {
    }

    public async Task<GetZoomArticlesResult> Handle(
        GetZoomArticlesQuery request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Query articles from reference table filtered by societe
        // 2. Apply search filter if provided (code or libelle contains search_term)
        // 3. Filter for active articles only
        // 4. Sort by code_article
        // 5. Limit results
        // 6. Return with prices and information for selection

        // Placeholder implementation
        return await Task.FromResult(new GetZoomArticlesResult
        {
            Found = false,
            TotalCount = 0,
            Articles = new()
        });
    }
}
