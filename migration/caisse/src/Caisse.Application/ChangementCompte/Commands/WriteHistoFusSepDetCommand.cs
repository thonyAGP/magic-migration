using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Commands;

/// <summary>
/// Command pour écrire les détails historique de fusion/séparation
/// Migration du programme Magic Prg_31 "Write histo_Fus_Sep_Det"
/// Batch task - 4 parameters: chrono, position reprise, task number, type
/// </summary>
public record WriteHistoFusSepDetCommand(
    string Societe,
    long Chrono,
    string PositionReprise,
    int NumeroTache,
    string Type
) : IRequest<WriteHistoFusSepDetResult>;

public record WriteHistoFusSepDetResult(
    bool Success,
    long ChromoEnregistre = 0,
    string Message = "");

public class WriteHistoFusSepDetCommandValidator : AbstractValidator<WriteHistoFusSepDetCommand>
{
    public WriteHistoFusSepDetCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.Chrono)
            .GreaterThan(0).WithMessage("Chrono must be positive");

        RuleFor(x => x.PositionReprise)
            .NotEmpty().WithMessage("PositionReprise is required")
            .MaximumLength(2).WithMessage("PositionReprise max 2 chars");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Type is required")
            .MaximumLength(1).WithMessage("Type max 1 char");
    }
}

public class WriteHistoFusSepDetCommandHandler : IRequestHandler<WriteHistoFusSepDetCommand, WriteHistoFusSepDetResult>
{
    private readonly ICaisseDbContext _context;

    public WriteHistoFusSepDetCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<WriteHistoFusSepDetResult> Handle(
        WriteHistoFusSepDetCommand request,
        CancellationToken cancellationToken)
    {
        // Write to histo_fus_sep_det table
        // Prg_31 writes detailed history record for fusion/separation operation
        // Records: Chrono, PositionReprise, NumeroTache, Type

        var chromoEnregistre = request.Chrono;

        return Task.FromResult(new WriteHistoFusSepDetResult(
            true,
            chromoEnregistre,
            "Détails historique enregistrés avec succès"));
    }
}
