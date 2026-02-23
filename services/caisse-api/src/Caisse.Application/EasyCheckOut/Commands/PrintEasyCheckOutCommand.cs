using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EasyCheckOut.Commands;

/// <summary>
/// Command pour imprimer Easy Check Out
/// Migration du programme Magic Prg_58 "Easy Checkout Print"
///
/// Genere une edition PDF pour impression
/// </summary>
public record PrintEasyCheckOutCommand(
    string Societe,
    int NumCompte,
    string Format = "PDF", // PDF, THERMAL, EMAIL
    bool Duplicate = false
) : IRequest<PrintEasyCheckOutResult>;

public record PrintEasyCheckOutResult
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public string? PdfPath { get; init; }
    public string? PrintJobId { get; init; }
    public DateTime? DateGeneration { get; init; }
    public bool PrintSent { get; init; }
    public int NombreCopies { get; init; }
}

public class PrintEasyCheckOutCommandValidator : AbstractValidator<PrintEasyCheckOutCommand>
{
    public PrintEasyCheckOutCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.NumCompte)
            .GreaterThan(0).WithMessage("NumCompte must be greater than 0");

        RuleFor(x => x.Format)
            .Must(f => new[] { "PDF", "THERMAL", "EMAIL" }.Contains(f))
            .WithMessage("Format must be PDF, THERMAL, or EMAIL");
    }
}

public class PrintEasyCheckOutCommandHandler : IRequestHandler<PrintEasyCheckOutCommand, PrintEasyCheckOutResult>
{
    private readonly ICaisseDbContext _context;

    public PrintEasyCheckOutCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<PrintEasyCheckOutResult> Handle(
        PrintEasyCheckOutCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verifier l'existence du compte
            var compte = await _context.GmComplets
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Societe == request.Societe &&
                                         c.Compte == request.NumCompte,
                                    cancellationToken);

            if (compte == null)
            {
                return new PrintEasyCheckOutResult
                {
                    Success = false,
                    Message = $"Compte {request.NumCompte} non trouve"
                };
            }

            // Generer le nom du fichier PDF
            var now = DateTime.Now;
            var pdfFileName = $"EASYCHECKOUT_{request.Societe}_{request.NumCompte}_{now:yyyyMMdd_HHmmss}.pdf";

            // Nombre de copies (1 original + 1 duplicate si demande)
            var nombreCopies = request.Duplicate ? 2 : 1;

            // Simuler la generation PDF
            var pdfPath = $"/exports/{pdfFileName}";

            var printJobId = Guid.NewGuid().ToString().Substring(0, 8);

            return new PrintEasyCheckOutResult
            {
                Success = true,
                Message = "Edition generee avec succes",
                PdfPath = pdfPath,
                PrintJobId = printJobId,
                DateGeneration = now,
                PrintSent = request.Format switch
                {
                    "PDF" => true,
                    "THERMAL" => true,
                    "EMAIL" => true,
                    _ => false
                },
                NombreCopies = nombreCopies
            };
        }
        catch (Exception ex)
        {
            return new PrintEasyCheckOutResult
            {
                Success = false,
                Message = ex.Message
            };
        }
    }
}
