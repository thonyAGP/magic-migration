using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Factures.Queries;

/// <summary>
/// Query pour récupérer les factures Check Out d'un client
/// Migration du programme Magic Prg_54 "FACTURES_CHECK_OUT"
///
/// Paramètres originaux Magic:
/// 1. Societe (A1)
/// 2. Code_Gm (N8)
/// 3. Filiation (N3)
/// 4. NumeroFact (A)
/// 5. TypeFacture (A)
/// 6. Operateur (A)
/// 7. Commentaire (U)
/// 8. EditionAuto (B)
/// </summary>
public record GetFacturesCheckOutQuery(
    string Societe,
    int CodeGm,
    int Filiation
) : IRequest<GetFacturesCheckOutResult>;

public record GetFacturesCheckOutResult
{
    public bool Success { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public int NombreFactures { get; init; }
    public decimal TotalHT { get; init; }
    public decimal TotalTVA { get; init; }
    public decimal TotalTTC { get; init; }
    public List<FactureDto> Factures { get; init; } = new();
}

public record FactureDto
{
    public string NumeroFacture { get; init; } = string.Empty;
    public DateOnly DateFacture { get; init; }
    public string TypeFacture { get; init; } = string.Empty;
    public decimal MontantHT { get; init; }
    public decimal MontantTVA { get; init; }
    public decimal MontantTTC { get; init; }
    public string Etat { get; init; } = string.Empty;
    public string LibelleEtat { get; init; } = string.Empty;
}

public class GetFacturesCheckOutQueryValidator : AbstractValidator<GetFacturesCheckOutQuery>
{
    public GetFacturesCheckOutQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");
    }
}

public class GetFacturesCheckOutQueryHandler : IRequestHandler<GetFacturesCheckOutQuery, GetFacturesCheckOutResult>
{
    private readonly ICaisseDbContext _context;

    public GetFacturesCheckOutQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetFacturesCheckOutResult> Handle(
        GetFacturesCheckOutQuery request,
        CancellationToken cancellationToken)
    {
        // Récupérer les transactions comme factures potentielles
        // Note: bartransacent ne contient pas d'état - on prend toutes les transactions
        var transactions = await _context.TransactionsBarEntete
            .AsNoTracking()
            .Where(t => t.Societe == request.Societe &&
                       t.Adherent == request.CodeGm &&
                       t.Filiation == request.Filiation)
            .OrderByDescending(t => t.DateTicket)
            .ThenByDescending(t => t.TimeTicket)
            .ToListAsync(cancellationToken);

        var factures = transactions.Select(t => new FactureDto
        {
            NumeroFacture = $"F{t.DateTicket}{t.TicketNumber}",
            DateFacture = ParseDateTicket(t.DateTicket),
            TypeFacture = t.TaiCodeForfait,
            MontantHT = (decimal)(t.TotalTicket * 0.8), // Estimation HT (TVA 20%)
            MontantTVA = (decimal)(t.TotalTicket * 0.2),
            MontantTTC = (decimal)t.TotalTicket,
            Etat = t.TotalPaye >= t.TotalTicket ? "P" : "E", // P=Payée, E=En cours
            LibelleEtat = t.TotalPaye >= t.TotalTicket ? "Payée" : "En cours"
        }).ToList();

        var totalTTC = factures.Sum(f => f.MontantTTC);
        var totalHT = factures.Sum(f => f.MontantHT);
        var totalTVA = factures.Sum(f => f.MontantTVA);

        return new GetFacturesCheckOutResult
        {
            Success = true,
            Societe = request.Societe,
            CodeGm = request.CodeGm,
            Filiation = request.Filiation,
            NombreFactures = factures.Count(),
            TotalHT = totalHT,
            TotalTVA = totalTVA,
            TotalTTC = totalTTC,
            Factures = factures
        };
    }

    private static DateOnly ParseDateTicket(string dateTicket)
    {
        // Format: YYYYMMDD
        if (dateTicket.Length == 8 &&
            int.TryParse(dateTicket[..4], out var year) &&
            int.TryParse(dateTicket[4..6], out var month) &&
            int.TryParse(dateTicket[6..8], out var day))
        {
            return new DateOnly(year, month, day);
        }
        return DateOnly.MinValue;
    }
}
