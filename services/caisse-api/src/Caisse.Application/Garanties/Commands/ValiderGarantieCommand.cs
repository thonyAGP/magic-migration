using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Garanties.Commands;

/// <summary>
/// Command pour valider/confirmer une garantie
/// Migration du programme Magic Prg_114 "Validation Garantie"
/// </summary>
public record ValiderGarantieCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string TypeGarantie,
    string OperateurId,
    string? Motif = null) : IRequest<ValiderGarantieResult>;

public record ValiderGarantieResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public ValiderGarantieDataDto? Data { get; init; }
    public List<string> ValidationErrors { get; init; } = new();
}

public record ValiderGarantieDataDto
{
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public string NomCompte { get; init; } = string.Empty;
    public string TypeGarantie { get; init; } = string.Empty;
    public DateOnly? DateValidation { get; init; }
    public TimeOnly? HeureValidation { get; init; }
    public string Validateur { get; init; } = string.Empty;
    public string EtatValidation { get; init; } = string.Empty;
    public List<string> WarningMessages { get; init; } = new();
}

public class ValiderGarantieCommandValidator : AbstractValidator<ValiderGarantieCommand>
{
    public ValiderGarantieCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");

        RuleFor(x => x.TypeGarantie)
            .NotEmpty().WithMessage("TypeGarantie is required");

        RuleFor(x => x.OperateurId)
            .NotEmpty().WithMessage("OperateurId is required");
    }
}

public class ValiderGarantieCommandHandler : IRequestHandler<ValiderGarantieCommand, ValiderGarantieResult>
{
    private readonly ICaisseDbContext _context;

    public ValiderGarantieCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<ValiderGarantieResult> Handle(
        ValiderGarantieCommand request,
        CancellationToken cancellationToken)
    {
        var validationErrors = new List<string>();
        var warnings = new List<string>();

        // Verifier que le compte existe
        var compte = await _context.ComptesGm
            .FirstOrDefaultAsync(c =>
                c.Societe == request.Societe &&
                c.CodeAdherent == request.CodeGm &&
                c.Filiation == request.Filiation,
                cancellationToken);

        if (compte == null)
        {
            validationErrors.Add("Account not found");
            return new ValiderGarantieResult
            {
                Success = false,
                Message = "Validation failed",
                ValidationErrors = validationErrors
            };
        }

        // Verifier que le type de garantie existe
        var typeGarantie = await _context.Garanties
            .FirstOrDefaultAsync(g =>
                g.Societe == request.Societe &&
                g.CodeGarantie == request.TypeGarantie,
                cancellationToken);

        if (typeGarantie == null)
        {
            validationErrors.Add($"Guarantee type {request.TypeGarantie} not found");
            return new ValiderGarantieResult
            {
                Success = false,
                Message = "Validation failed",
                ValidationErrors = validationErrors
            };
        }

        // Verifier les depots de garantie actifs
        var depots = await _context.DepotGaranties
            .Where(d =>
                d.Societe == request.Societe &&
                d.CodeGm == request.CodeGm &&
                d.Filiation == request.Filiation &&
                d.Etat == "A") // Actifs
            .ToListAsync(cancellationToken);

        if (depots.Count == 0)
        {
            validationErrors.Add("No active guarantee deposits found for this account");
        }

        // Verifications supplementaires
        if (compte.SoldeDuCompte < 0)
        {
            warnings.Add("Account has negative balance");
        }

        if (compte.Etat != "A")
        {
            warnings.Add($"Account state is {compte.Etat}, not Active");
        }

        var success = validationErrors.Count == 0;

        return new ValiderGarantieResult
        {
            Success = success,
            Message = success ? "Guarantee validation successful" : "Validation failed",
            Data = success ? new ValiderGarantieDataDto
            {
                Societe = request.Societe,
                CodeGm = request.CodeGm,
                Filiation = request.Filiation,
                NomCompte = compte.NomPrenom,
                TypeGarantie = request.TypeGarantie,
                DateValidation = DateOnly.FromDateTime(DateTime.Now),
                HeureValidation = TimeOnly.FromDateTime(DateTime.Now),
                Validateur = request.OperateurId,
                EtatValidation = "V", // Validated
                WarningMessages = warnings
            } : null,
            ValidationErrors = validationErrors
        };
    }
}
