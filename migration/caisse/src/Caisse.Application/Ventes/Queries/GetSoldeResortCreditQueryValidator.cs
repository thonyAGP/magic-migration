using FluentValidation;

namespace Caisse.Application.Ventes.Queries;

public class GetSoldeResortCreditQueryValidator : AbstractValidator<GetSoldeResortCreditQuery>
{
    public GetSoldeResortCreditQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe requis")
            .MaximumLength(2).WithMessage("Societe max 2 caracteres");

        RuleFor(x => x.Compte)
            .GreaterThan(0).WithMessage("Compte invalide");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation invalide");

        RuleFor(x => x.Service)
            .NotEmpty().WithMessage("Service requis")
            .MaximumLength(4).WithMessage("Service max 4 caracteres");
    }
}
