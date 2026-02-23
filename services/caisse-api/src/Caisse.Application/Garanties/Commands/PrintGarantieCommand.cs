using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Garanties.Commands;

/// <summary>
/// Command pour imprimer/exporter les donnees de garantie
/// Migration du programme Magic Prg_112 "Print Garantie"
/// </summary>
public record PrintGarantieCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string Format = "PDF") : IRequest<PrintGarantieResult>;

public record PrintGarantieResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public byte[]? DocumentData { get; init; }
    public string DocumentName { get; init; } = string.Empty;
    public string MimeType { get; init; } = "application/pdf";
    public PrintGarantieDataDto? Data { get; init; }
}

public record PrintGarantieDataDto
{
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public string NomCompte { get; init; } = string.Empty;
    public string EtatCompte { get; init; } = string.Empty;
    public double SoldeCompte { get; init; }
    public DateOnly? DateImpression { get; init; }
    public List<PrintDepotDto> Depots { get; init; } = new();
    public double TotalMontant { get; init; }
    public int TotalDepots { get; init; }
}

public record PrintDepotDto
{
    public DateOnly? DateDepot { get; init; }
    public string TypeDepot { get; init; } = string.Empty;
    public string Devise { get; init; } = string.Empty;
    public double Montant { get; init; }
    public string Etat { get; init; } = string.Empty;
    public string Operateur { get; init; } = string.Empty;
    public DateOnly? DateRetrait { get; init; }
}

public class PrintGarantieCommandValidator : AbstractValidator<PrintGarantieCommand>
{
    public PrintGarantieCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");

        RuleFor(x => x.Format)
            .Must(f => f == "PDF" || f == "CSV" || f == "EXCEL")
            .WithMessage("Format must be PDF, CSV, or EXCEL");
    }
}

public class PrintGarantieCommandHandler : IRequestHandler<PrintGarantieCommand, PrintGarantieResult>
{
    private readonly ICaisseDbContext _context;

    public PrintGarantieCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<PrintGarantieResult> Handle(
        PrintGarantieCommand request,
        CancellationToken cancellationToken)
    {
        // Recuperer le compte
        var compte = await _context.ComptesGm
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.CodeAdherent == request.CodeGm &&
                c.Filiation == request.Filiation,
                cancellationToken);

        if (compte == null)
        {
            return new PrintGarantieResult
            {
                Success = false,
                Message = "Account not found"
            };
        }

        // Recuperer les depots de garantie
        var depots = await _context.DepotGaranties
            .AsNoTracking()
            .Where(d =>
                d.Societe == request.Societe &&
                d.CodeGm == request.CodeGm &&
                d.Filiation == request.Filiation)
            .OrderByDescending(d => d.DateDepot)
            .ToListAsync(cancellationToken);

        var printDepots = depots.Select(d => new PrintDepotDto
        {
            DateDepot = d.DateDepot,
            TypeDepot = d.TypeDepot,
            Devise = d.Devise,
            Montant = d.Montant,
            Etat = d.Etat,
            Operateur = d.Operateur,
            DateRetrait = d.DateRetrait
        }).ToList();

        var data = new PrintGarantieDataDto
        {
            Societe = compte.Societe,
            CodeGm = compte.CodeAdherent,
            Filiation = compte.Filiation,
            NomCompte = compte.NomPrenom,
            EtatCompte = compte.Etat,
            SoldeCompte = compte.SoldeDuCompte,
            DateImpression = DateOnly.FromDateTime(DateTime.Now),
            Depots = printDepots,
            TotalMontant = printDepots.Sum(d => d.Montant),
            TotalDepots = printDepots.Count
        };

        // For now, return the data structure - actual PDF generation would be done by a service
        var documentName = $"Garantie_{compte.CodeAdherent}_{DateTime.Now:yyyyMMdd}.{GetFileExtension(request.Format)}";

        return new PrintGarantieResult
        {
            Success = true,
            Message = "Print document prepared successfully",
            DocumentName = documentName,
            MimeType = GetMimeType(request.Format),
            Data = data
        };
    }

    private static string GetFileExtension(string format) => format switch
    {
        "CSV" => "csv",
        "EXCEL" => "xlsx",
        _ => "pdf"
    };

    private static string GetMimeType(string format) => format switch
    {
        "CSV" => "text/csv",
        "EXCEL" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        _ => "application/pdf"
    };
}
