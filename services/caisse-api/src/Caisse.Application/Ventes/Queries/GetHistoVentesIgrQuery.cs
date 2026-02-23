using FluentValidation;
using MediatR;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query to retrieve IGR (In-house use) sales history.
/// Migrated from Magic Prg_248 "Histo ventes IGR"
/// </summary>
public record GetHistoVentesIgrQuery(
    string Societe,
    int CodeGm,
    int Filiation,
    string? DateDebut = null,
    string? DateFin = null,
    int Limit = 50) : IRequest<GetHistoVentesIgrResult>;

public record GetHistoVentesIgrResult
{
    public bool Found { get; init; }
    public int TotalTransactions { get; init; }
    public double MontantTotal { get; init; }
    public List<VenteIgrDto> Ventes { get; init; } = new();
}

public record VenteIgrDto
{
    public long TransactionId { get; init; }
    public DateOnly DateComptable { get; init; }
    public TimeOnly HeureTransaction { get; init; }
    public string CodeIgr { get; init; } = string.Empty;
    public string LibelleIgr { get; init; } = string.Empty;
    public double MontantTotal { get; init; }
    public string Operateur { get; init; } = string.Empty;
}

public class GetHistoVentesIgrQueryValidator : AbstractValidator<GetHistoVentesIgrQuery>
{
    public GetHistoVentesIgrQueryValidator()
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

public class GetHistoVentesIgrQueryHandler : IRequestHandler<GetHistoVentesIgrQuery, GetHistoVentesIgrResult>
{
    public GetHistoVentesIgrQueryHandler()
    {
    }

    public async Task<GetHistoVentesIgrResult> Handle(
        GetHistoVentesIgrQuery request,
        CancellationToken cancellationToken)
    {
        // Magic program logic:
        // 1. Query TransactionsBarEntete for transactions with type="IGR"
        // 2. Filter by societe, code_gm, filiation, date range
        // 3. Join with reference table for IGR codes/descriptions
        // 4. Sort by date descending, limit results
        // 5. Calculate total amount

        // Placeholder implementation
        return await Task.FromResult(new GetHistoVentesIgrResult
        {
            Found = false,
            TotalTransactions = 0,
            MontantTotal = 0,
            Ventes = new()
        });
    }
}
