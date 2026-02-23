using FluentValidation;

namespace Caisse.Application.Details.Commands;

public class AddSessionDetailCommandValidator : AbstractValidator<AddSessionDetailCommand>
{
    private static readonly string[] ValidTypes = { "I", "C", "K", "L", "A", "D", "F", "V" };
    private static readonly string[] ValidQuand = { "O", "F", "P" };

    public AddSessionDetailCommandValidator()
    {
        RuleFor(x => x.Utilisateur)
            .NotEmpty().WithMessage("Utilisateur requis")
            .MaximumLength(8).WithMessage("Utilisateur max 8 caracteres");

        RuleFor(x => x.ChronoSession)
            .GreaterThan(0).WithMessage("ChronoSession invalide");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Type requis")
            .MaximumLength(1).WithMessage("Type max 1 caractere")
            .Must(t => ValidTypes.Contains(t)).WithMessage("Type invalide (I/C/K/L/A/D/F/V)");

        RuleFor(x => x.Quand)
            .NotEmpty().WithMessage("Quand requis")
            .MaximumLength(1).WithMessage("Quand max 1 caractere")
            .Must(q => ValidQuand.Contains(q)).WithMessage("Quand invalide (O/F/P)");
    }
}
