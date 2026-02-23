using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to retrieve complimentary (free) sales history.
/// Migrated from Magic Prg_249 "Histo ventes Gratuités"
/// </summary>
public record GetHistoVentesGratuitesQuery(
    string Societe,
    int CodeGm,
    int Filiation,
    string? DateDebut = null,
    string? DateFin = null,
    int Limit = 50) : IRequest<GetHistoVentesGratuitesResult>;

public record GetHistoVentesGratuitesResult
{
    public bool Found { get; init; }
    public int TotalTransactions { get; init; }
    public double MontantTotal { get; init; }
    public List<VenteGratuitDto> Ventes { get; init; } = new();
}

public record VenteGratuitDto
{
    public long TransactionId { get; init; }
    public DateOnly DateComptable { get; init; }
    public TimeOnly HeureTransaction { get; init; }
    public string CodeGratuit { get; init; } = string.Empty;
    public string LibelleGratuit { get; init; } = string.Empty;
    public double MontantTotal { get; init; }
    public string Operateur { get; init; } = string.Empty;
    public string Motif { get; init; } = string.Empty;
}

public class GetHistoVentesGratuitesQueryValidator : AbstractValidator<GetHistoVentesGratuitesQuery>
{
    public GetHistoVentesGratuitesQueryValidator()
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

public class GetHistoVentesGratuitesQueryHandler : IRequestHandler<GetHistoVentesGratuitesQuery, GetHistoVentesGratuitesResult>
{
    public GetHistoVentesGratuitesQueryHandler()
    {
    }

    public async Task<GetHistoVentesGratuitesResult> Handle(
        GetHistoVentesGratuitesQuery request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Query TransactionsBarEntete for transactions with type="GRATUITE" or mode_paiement="GRATUIT"
        // 2. Filter by societe, code_gm, filiation, date range
        // 3. Join with reference table for gratuity codes/descriptions
        // 4. Sort by date descending, limit results
        // 5. Calculate total amount and gratuity types

        // Placeholder implementation
        return await Task.FromResult(new GetHistoVentesGratuitesResult
        {
            Found = false,
            TotalTransactions = 0,
            MontantTotal = 0,
            Ventes = new()
        });
    }
}
