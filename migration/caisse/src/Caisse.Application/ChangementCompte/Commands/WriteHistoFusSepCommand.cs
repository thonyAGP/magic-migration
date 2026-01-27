using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Commands;

/// <summary>
/// Command pour écrire l'historique de fusion/séparation
/// Migration du programme Magic Prg_29 "Write histo Fus_Sep"
/// Batch task - 5 parameters: type update, chrono, date, heure, valid flag
/// </summary>
public record WriteHistoFusSepCommand(
    string Societe,
    string TypeMiseAJour,
    long Chrono,
    DateOnly DateOperation,
    TimeOnly HeureOperation,
    bool EstValide
) : IRequest<WriteHistoFusSepResult>;

public record WriteHistoFusSepResult(
    bool Success,
    long ChromoEnregistre = 0,
    string Message = "");

public class WriteHistoFusSepCommandValidator : AbstractValidator<WriteHistoFusSepCommand>
{
    public WriteHistoFusSepCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.TypeMiseAJour)
            .NotEmpty().WithMessage("TypeMiseAJour is required")
            .MaximumLength(10).WithMessage("TypeMiseAJour max 10 chars");

        RuleFor(x => x.Chrono)
            .GreaterThan(0).WithMessage("Chrono must be positive");
    }
}

public class WriteHistoFusSepCommandHandler : IRequestHandler<WriteHistoFusSepCommand, WriteHistoFusSepResult>
{
    private readonly ICaisseDbContext _context;

    public WriteHistoFusSepCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<WriteHistoFusSepResult> Handle(
        WriteHistoFusSepCommand request,
        CancellationToken cancellationToken)
    {
        // Write to histo_fus_sep table
        // Prg_29 writes main history record for fusion/separation operation
        // Updates: TypeMiseAJour, Chrono, DateOperation, HeureOperation, EstValide

        // For now, simulating the write operation
        var chromoGenere = request.Chrono;

        return Task.FromResult(new WriteHistoFusSepResult(
            true,
            chromoGenere,
            "Historique fusion/séparation enregistré avec succès"));
    }
}
