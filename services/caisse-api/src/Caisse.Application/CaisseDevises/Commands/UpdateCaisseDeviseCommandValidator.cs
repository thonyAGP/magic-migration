using FluentValidation;

namespace Caisse.Application.CaisseDevises.Commands;

public class UpdateCaisseDeviseCommandValidator : AbstractValidator<UpdateCaisseDeviseCommand>
{
    private static readonly string[] ValidTypes = { "I", "C", "K", "L", "A", "D", "F", "V" };
    private static readonly string[] ValidQuand = { "O", "F", "P" };

    public UpdateCaisseDeviseCommandValidator()
    {
        RuleFor(x => x.Utilisateur)
            .NotEmpty().WithMessage("Utilisateur requis")
            .MaximumLength(8).WithMessage("Utilisateur max 8 caracteres");

        RuleFor(x => x.CodeDevise)
            .NotEmpty().WithMessage("CodeDevise requis")
            .MaximumLength(6).WithMessage("CodeDevise max 6 caracteres");

        RuleFor(x => x.ModePaiement)
            .NotEmpty().WithMessage("ModePaiement requis")
            .MaximumLength(8).WithMessage("ModePaiement max 8 caracteres");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Type requis")
            .MaximumLength(2).WithMessage("Type max 2 caracteres");

        RuleFor(x => x.Quand)
            .NotEmpty().WithMessage("Quand requis")
            .MaximumLength(2).WithMessage("Quand max 2 caracteres");

        RuleFor(x => x.Quantite)
            .GreaterThanOrEqualTo(0).WithMessage("Quantite doit etre positive");
    }
}
