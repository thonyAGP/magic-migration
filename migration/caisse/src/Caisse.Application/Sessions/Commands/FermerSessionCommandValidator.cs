using FluentValidation;

namespace Caisse.Application.Sessions.Commands;

public class FermerSessionCommandValidator : AbstractValidator<FermerSessionCommand>
{
    public FermerSessionCommandValidator()
    {
        RuleFor(x => x.Utilisateur)
            .NotEmpty().WithMessage("Utilisateur requis")
            .MaximumLength(8).WithMessage("Utilisateur max 8 caracteres");

        RuleFor(x => x.ChronoSession)
            .GreaterThan(0).WithMessage("ChronoSession invalide");
    }
}
