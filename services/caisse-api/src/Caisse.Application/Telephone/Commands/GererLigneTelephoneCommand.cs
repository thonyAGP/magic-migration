using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Telephone.Commands;

/// <summary>
/// Command pour ouvrir/fermer une ligne téléphonique
/// Migration des programmes Magic Prg_208 "OPEN_PHONE_LINE" et Prg_210 "CLOSE_PHONE_LINE"
/// </summary>
public record GererLigneTelephoneCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    string NumeroPoste,
    string Operation,  // "OPEN" ou "CLOSE"
    string Operateur
) : IRequest<GererLigneTelephoneResult>;

public record GererLigneTelephoneResult
{
    public bool Success { get; init; }
    public string NumeroPoste { get; init; } = string.Empty;
    public string Operation { get; init; } = string.Empty;
    public string NouvelEtat { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}

public class GererLigneTelephoneCommandValidator : AbstractValidator<GererLigneTelephoneCommand>
{
    public GererLigneTelephoneCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");

        RuleFor(x => x.NumeroPoste)
            .NotEmpty().WithMessage("NumeroPoste is required")
            .MaximumLength(10).WithMessage("NumeroPoste must be at most 10 characters");

        RuleFor(x => x.Operation)
            .NotEmpty().WithMessage("Operation is required")
            .Must(o => o == "OPEN" || o == "CLOSE")
            .WithMessage("Operation must be 'OPEN' or 'CLOSE'");

        RuleFor(x => x.Operateur)
            .NotEmpty().WithMessage("Operateur is required")
            .MaximumLength(10).WithMessage("Operateur must be at most 10 characters");
    }
}

public class GererLigneTelephoneCommandHandler : IRequestHandler<GererLigneTelephoneCommand, GererLigneTelephoneResult>
{
    private readonly ICaisseDbContext _context;

    public GererLigneTelephoneCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GererLigneTelephoneResult> Handle(
        GererLigneTelephoneCommand request,
        CancellationToken cancellationToken)
    {
        // Chercher la ligne téléphonique
        var ligne = await _context.LignesTelephone
            .FirstOrDefaultAsync(l =>
                l.Societe == request.Societe &&
                l.CodeGm == request.CodeGm &&
                l.Filiation == request.Filiation &&
                l.NumeroPoste == request.NumeroPoste,
                cancellationToken);

        if (ligne == null)
        {
            return new GererLigneTelephoneResult
            {
                Success = false,
                NumeroPoste = request.NumeroPoste,
                Operation = request.Operation,
                Message = $"Ligne téléphonique non trouvée: {request.NumeroPoste}"
            };
        }

        // Appliquer l'opération
        if (request.Operation == "OPEN")
        {
            if (ligne.IsOpen)
            {
                return new GererLigneTelephoneResult
                {
                    Success = false,
                    NumeroPoste = request.NumeroPoste,
                    Operation = request.Operation,
                    NouvelEtat = ligne.Etat,
                    Message = "La ligne est déjà ouverte"
                };
            }

            ligne.Ouvrir(request.Operateur);
        }
        else // CLOSE
        {
            if (ligne.IsClosed)
            {
                return new GererLigneTelephoneResult
                {
                    Success = false,
                    NumeroPoste = request.NumeroPoste,
                    Operation = request.Operation,
                    NouvelEtat = ligne.Etat,
                    Message = "La ligne est déjà fermée"
                };
            }

            ligne.Fermer(request.Operateur);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new GererLigneTelephoneResult
        {
            Success = true,
            NumeroPoste = request.NumeroPoste,
            Operation = request.Operation,
            NouvelEtat = ligne.Etat,
            Message = request.Operation == "OPEN"
                ? "Ligne téléphonique ouverte avec succès"
                : "Ligne téléphonique fermée avec succès"
        };
    }
}
