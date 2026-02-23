using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to retrieve validated VAD (Vente à Distance/Remote Sales) for printing.
/// Migrated from Magic Prg_251 "VAD validés à imprimer"
/// </summary>
public record GetVadValidesQuery(
    string Societe,
    int CodeGm,
    int Filiation,
    DateOnly? DateDebut = null,
    DateOnly? DateFin = null,
    int Limit = 50) : IRequest<GetVadValidesResult>;

public record GetVadValidesResult
{
    public bool Found { get; init; }
    public int TotalCount { get; init; }
    public List<VadValidDto> VadsValidees { get; init; } = new();
}

public record VadValidDto
{
    public long VadId { get; init; }
    public string CodeVad { get; init; } = string.Empty;
    public DateOnly DateVad { get; init; }
    public TimeOnly HeureVad { get; init; }
    public double MontantVad { get; init; }
    public string EtatVad { get; init; } = string.Empty; // "V" = Validated, "P" = Printed
    public string ClientIdentifiant { get; init; } = string.Empty;
    public string AdresseLivraison { get; init; } = string.Empty;
    public bool Imprimable { get; init; }
}

public class GetVadValidesQueryValidator : AbstractValidator<GetVadValidesQuery>
{
    public GetVadValidesQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 500).WithMessage("Limit must be between 1 and 500");
    }
}

public class GetVadValidesQueryHandler : IRequestHandler<GetVadValidesQuery, GetVadValidesResult>
{
    public GetVadValidesQueryHandler()
    {
    }

    public async Task<GetVadValidesResult> Handle(
        GetVadValidesQuery request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Query VAD records with status "V" (Validated)
        // 2. Filter by societe, code_gm, filiation, date range
        // 3. Join with customer and delivery information
        // 4. Exclude already printed records (status != "P")
        // 5. Sort by date ascending (oldest first for batch printing)
        // 6. Limit results
        // 7. Return list ready for printing

        // Placeholder implementation
        return await Task.FromResult(new GetVadValidesResult
        {
            Found = false,
            TotalCount = 0,
            VadsValidees = new()
        });
    }
}
