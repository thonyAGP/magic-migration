using FluentValidation;

namespace Caisse.Application.Ventes.Queries;

public class GetSoldeGiftPassQueryValidator : AbstractValidator<GetSoldeGiftPassQuery>
{
    public GetSoldeGiftPassQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe requis")
            .MaximumLength(2).WithMessage("Societe max 2 caracteres");

        RuleFor(x => x.Compte)
            .GreaterThan(0).WithMessage("Compte invalide");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation invalide");
    }
}
