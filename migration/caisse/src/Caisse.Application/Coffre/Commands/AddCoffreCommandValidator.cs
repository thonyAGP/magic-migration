using FluentValidation;

namespace Caisse.Application.Coffre.Commands;

public class AddCoffreCommandValidator : AbstractValidator<AddCoffreCommand>
{
    public AddCoffreCommandValidator()
    {
        RuleFor(x => x.Utilisateur)
            .NotEmpty().WithMessage("Utilisateur requis")
            .MaximumLength(8).WithMessage("Utilisateur max 8 caracteres");

        RuleFor(x => x.Chrono)
            .GreaterThan(0).WithMessage("Chrono invalide");
    }
}
