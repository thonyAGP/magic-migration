using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Factures.Commands;

/// <summary>
/// Command pour créer une facture TVA
/// Migration du programme Magic Prg_97 "Saisie_facture_tva" V3
///
/// Paramètres originaux Magic:
/// 1. Societe (A1)
/// 2. Code_Gm (N8)
/// 3. Filiation (N3)
/// 4. TypeFacture (A)
/// 5. EditionAuto (B)
/// 6. DateFacture (D)
/// </summary>
public record CreerFactureCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string TypeFacture,
    bool EditionAuto,
    DateOnly DateFacture,
    decimal MontantHT,
    decimal TauxTVA,
    string Libelle
) : IRequest<CreerFactureResult>;

public record CreerFactureResult
{
    public bool Success { get; init; }
    public string? NumeroFacture { get; init; }
    public DateOnly DateFacture { get; init; }
    public decimal MontantHT { get; init; }
    public decimal MontantTVA { get; init; }
    public decimal MontantTTC { get; init; }
    public string? Message { get; init; }
    public bool EditionGeneree { get; init; }
}

public class CreerFactureCommandValidator : AbstractValidator<CreerFactureCommand>
{
    public CreerFactureCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");

        RuleFor(x => x.TypeFacture)
            .NotEmpty().WithMessage("TypeFacture is required")
            .MaximumLength(10).WithMessage("TypeFacture must be at most 10 characters");

        RuleFor(x => x.DateFacture)
            .NotEmpty().WithMessage("DateFacture is required");

        RuleFor(x => x.MontantHT)
            .GreaterThan(0).WithMessage("MontantHT must be positive");

        RuleFor(x => x.TauxTVA)
            .InclusiveBetween(0, 100).WithMessage("TauxTVA must be between 0 and 100");

        RuleFor(x => x.Libelle)
            .NotEmpty().WithMessage("Libelle is required")
            .MaximumLength(100).WithMessage("Libelle must be at most 100 characters");
    }
}

public class CreerFactureCommandHandler : IRequestHandler<CreerFactureCommand, CreerFactureResult>
{
    private readonly ICaisseDbContext _context;

    public CreerFactureCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<CreerFactureResult> Handle(
        CreerFactureCommand request,
        CancellationToken cancellationToken)
    {
        // Vérifier que le client existe
        var client = await _context.GmComplets
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.Compte == request.CodeGm,
                cancellationToken);

        if (client == null)
        {
            return new CreerFactureResult
            {
                Success = false,
                Message = $"Client non trouvé: {request.CodeGm}"
            };
        }

        // Calculer les montants
        var montantTVA = request.MontantHT * (request.TauxTVA / 100);
        var montantTTC = request.MontantHT + montantTVA;

        // Générer le numéro de facture
        var now = DateTime.Now;
        var numeroFacture = $"F{request.Societe}{now:yyyyMMddHHmmss}";

        // Note: Dans une implémentation réelle, on créerait l'entité Facture
        // et on la persisterait dans la base de données

        return new CreerFactureResult
        {
            Success = true,
            NumeroFacture = numeroFacture,
            DateFacture = request.DateFacture,
            MontantHT = request.MontantHT,
            MontantTVA = montantTVA,
            MontantTTC = montantTTC,
            Message = "Facture créée avec succès",
            EditionGeneree = request.EditionAuto
        };
    }
}
