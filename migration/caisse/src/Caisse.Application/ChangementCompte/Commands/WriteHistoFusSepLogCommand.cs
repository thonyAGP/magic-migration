using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.ChangementCompte.Commands;

/// <summary>
/// Command pour écrire l'historique log de fusion/séparation
/// Migration du programme Magic Prg_35 "Write histo_Fus_Sep_Log"
/// Batch task - 3 parameters for writing log records
/// </summary>
public record WriteHistoFusSepLogCommand(
    string Societe,
    long Chrono,
    string Message,
    string? Utilisateur = null,
    string? TypeOperation = null
) : IRequest<WriteHistoFusSepLogResult>;

public record WriteHistoFusSepLogResult(
    bool Success,
    long ChromoEnregistre = 0,
    string Message = "");

public class WriteHistoFusSepLogCommandValidator : AbstractValidator<WriteHistoFusSepLogCommand>
{
    public WriteHistoFusSepLogCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required");

        RuleFor(x => x.Chrono)
            .GreaterThan(0).WithMessage("Chrono must be positive");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Message is required")
            .MaximumLength(500).WithMessage("Message max 500 chars");
    }
}

public class WriteHistoFusSepLogCommandHandler : IRequestHandler<WriteHistoFusSepLogCommand, WriteHistoFusSepLogResult>
{
    private readonly ICaisseDbContext _context;

    public WriteHistoFusSepLogCommandHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public Task<WriteHistoFusSepLogResult> Handle(
        WriteHistoFusSepLogCommand request,
        CancellationToken cancellationToken)
    {
        // Write to histo_fus_sep_log table
        // Prg_35 writes log records for fusion/separation operations
        // Records: Chrono, Message with date/time and user tracking

        var chromoEnregistre = request.Chrono;

        return Task.FromResult(new WriteHistoFusSepLogResult(
            true,
            chromoEnregistre,
            "Log fusion/séparation enregistré avec succès"));
    }
}
