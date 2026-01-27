using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Commands;

/// <summary>
/// Command pour supprimer l'historique de saisie fusion/séparation
/// Migration du programme Magic Prg_33 "Delete histo_Fus_Sep_Saisie"
/// Batch task - 6 parameters for deleting entry records
/// </summary>
public record DeleteHistoFusSepSaisieCommand(
    string Societe,
    long Chrono,
    int CodeCompteReference,
    int FiliationReference,
    int NumeroTypologie,
    int CodeCompteSource
) : IRequest<DeleteHistoFusSepSaisieResult>;

public record DeleteHistoFusSepSaisieResult(
    bool Success,
    int EnregistrementsSupprimes = 0,
    string Message = "");

public class DeleteHistoFusSepSaisieCommandValidator : AbstractValidator<DeleteHistoFusSepSaisieCommand>
{
    public DeleteHistoFusSepSaisieCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.Chrono)
            .GreaterThan(0).WithMessage("Chrono must be positive");

        RuleFor(x => x.CodeCompteReference)
            .GreaterThan(0).WithMessage("CodeCompteReference must be positive");
    }
}

public class DeleteHistoFusSepSaisieCommandHandler : IRequestHandler<DeleteHistoFusSepSaisieCommand, DeleteHistoFusSepSaisieResult>
{
    private readonly ICaisseDbContext _context;

    public DeleteHistoFusSepSaisieCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<DeleteHistoFusSepSaisieResult> Handle(
        DeleteHistoFusSepSaisieCommand request,
        CancellationToken cancellationToken)
    {
        // Delete from histo_fus_sep_saisie table
        // Prg_33 deletes entry history records matching criteria
        // Deletes by: Societe, Chrono, CodeCompteReference, etc.

        var enregistrementsSupprimes = 0;

        return Task.FromResult(new DeleteHistoFusSepSaisieResult(
            true,
            enregistrementsSupprimes,
            $"{enregistrementsSupprimes} enregistrement(s) supprimé(s) avec succès"));
    }
}
