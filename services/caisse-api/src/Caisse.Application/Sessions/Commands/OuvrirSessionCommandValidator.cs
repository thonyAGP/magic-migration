using FluentValidation;

namespace Caisse.Application.Sessions.Commands;

public class OuvrirSessionCommandValidator : AbstractValidator<OuvrirSessionCommand>
{
    public OuvrirSessionCommandValidator()
    {
        RuleFor(x => x.Utilisateur)
            .NotEmpty().WithMessage("Utilisateur requis")
            .MaximumLength(8).WithMessage("Utilisateur max 8 caracteres");

        RuleFor(x => x.Terminal)
            .NotEmpty().WithMessage("Terminal requis")
            .MaximumLength(10).WithMessage("Terminal max 10 caracteres");

        RuleFor(x => x.DateComptable)
            .NotEmpty().WithMessage("DateComptable requise")
            .Length(8).WithMessage("DateComptable doit etre au format YYYYMMDD")
            .Matches(@"^\d{8}$").WithMessage("DateComptable format invalide");

        RuleFor(x => x.MontantOuverture)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MontantOuverture.HasValue)
            .WithMessage("MontantOuverture ne peut pas etre negatif");

        RuleFor(x => x.MontantCoffre)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MontantCoffre.HasValue)
            .WithMessage("MontantCoffre ne peut pas etre negatif");
    }
}
