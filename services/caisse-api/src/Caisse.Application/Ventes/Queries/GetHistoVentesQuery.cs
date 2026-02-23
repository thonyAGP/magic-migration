using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Ventes.Queries;

/// <summary>
/// Query pour récupérer l'historique des ventes
/// Migration des programmes Magic Prg_239-241 "Histo ventes payantes"
/// Table: bartransacent
/// </summary>
public record GetHistoVentesQuery(
    string Societe,
    int CodeGm,
    int Filiation,
    string? DateDebut = null,
    string? DateFin = null,
    int Limit = 50) : IRequest<GetHistoVentesResult>;

public record GetHistoVentesResult
{
    public bool Found { get; init; }
    public int TotalTransactions { get; init; }
    public double MontantTotal { get; init; }
    public List<VenteDto> Ventes { get; init; } = new();
}

public record VenteDto
{
    public string BarId { get; init; } = string.Empty;
    public string TicketNumber { get; init; } = string.Empty;
    public string DateTicket { get; init; } = string.Empty;
    public string TimeTicket { get; init; } = string.Empty;
    public double TotalTicket { get; init; }
    public double TotalPaye { get; init; }
    public double TotalCreditConso { get; init; }
    public string EzCardId { get; init; } = string.Empty;
    public string PosId { get; init; } = string.Empty;
    public string BarmanId { get; init; } = string.Empty;
    public string TaiCodeForfait { get; init; } = string.Empty;
}

public class GetHistoVentesQueryValidator : AbstractValidator<GetHistoVentesQuery>
{
    public GetHistoVentesQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(10).WithMessage("Societe must be at most 10 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");

        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 500).WithMessage("Limit must be between 1 and 500");
    }
}

public class GetHistoVentesQueryHandler : IRequestHandler<GetHistoVentesQuery, GetHistoVentesResult>
{
    private readonly ICaisseDbContext _context;

    public GetHistoVentesQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetHistoVentesResult> Handle(
        GetHistoVentesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.TransactionsBarEntete
            .AsNoTracking()
            .Where(t =>
                t.Societe == request.Societe &&
                t.Adherent == request.CodeGm &&
                t.Filiation == request.Filiation);

        if (!string.IsNullOrEmpty(request.DateDebut))
            query = query.Where(t => string.Compare(t.DateTicket, request.DateDebut) >= 0);

        if (!string.IsNullOrEmpty(request.DateFin))
            query = query.Where(t => string.Compare(t.DateTicket, request.DateFin) <= 0);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalMontant = totalCount > 0
            ? await query.SumAsync(t => t.TotalTicket, cancellationToken)
            : 0;

        var transactions = await query
            .OrderByDescending(t => t.DateTicket)
            .ThenByDescending(t => t.TimeTicket)
            .Take(request.Limit)
            .Select(t => new VenteDto
            {
                BarId = t.BarId,
                TicketNumber = t.TicketNumber,
                DateTicket = t.DateTicket,
                TimeTicket = t.TimeTicket,
                TotalTicket = t.TotalTicket,
                TotalPaye = t.TotalPaye,
                TotalCreditConso = t.TotalCreditConso,
                EzCardId = t.EzCardId,
                PosId = t.PosId,
                BarmanId = t.BarmanId,
                TaiCodeForfait = t.TaiCodeForfait
            })
            .ToListAsync(cancellationToken);

        return new GetHistoVentesResult
        {
            Found = transactions.Count > 0,
            TotalTransactions = totalCount,
            MontantTotal = totalMontant,
            Ventes = transactions
        };
    }
}
