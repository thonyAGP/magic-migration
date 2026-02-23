using FluentValidation;

namespace Caisse.Application.Articles.Commands;

public class AddSessionArticleCommandValidator : AbstractValidator<AddSessionArticleCommand>
{
    public AddSessionArticleCommandValidator()
    {
        RuleFor(x => x.Utilisateur)
            .NotEmpty().WithMessage("Utilisateur requis")
            .MaximumLength(8).WithMessage("Utilisateur max 8 caracteres");

        RuleFor(x => x.ChronoSession)
            .GreaterThan(0).WithMessage("ChronoSession invalide");

        RuleFor(x => x.CodeArticle)
            .GreaterThan(0).WithMessage("CodeArticle invalide");

        RuleFor(x => x.LibelleArticle)
            .NotEmpty().WithMessage("LibelleArticle requis")
            .MaximumLength(32).WithMessage("LibelleArticle max 32 caracteres");

        RuleFor(x => x.PrixUnitaire)
            .GreaterThanOrEqualTo(0).WithMessage("PrixUnitaire doit etre positif");

        RuleFor(x => x.Quantite)
            .GreaterThan(0).WithMessage("Quantite doit etre > 0");
    }
}
