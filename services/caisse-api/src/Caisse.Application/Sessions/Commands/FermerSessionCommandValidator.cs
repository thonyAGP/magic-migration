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

        RuleFor(x => x.MontantCompteCaisse)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MontantCompteCaisse.HasValue)
            .WithMessage("MontantCompteCaisse ne peut pas etre negatif");

        RuleFor(x => x.SeuilAlerte)
            .GreaterThanOrEqualTo(0).WithMessage("SeuilAlerte ne peut pas etre negatif");

        RuleFor(x => x.CommentaireEcart)
            .MaximumLength(30).WithMessage("CommentaireEcart max 30 caracteres")
            .When(x => x.CommentaireEcart != null);
    }
}
