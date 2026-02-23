using FluentValidation;

namespace Caisse.Application.EasyCheckOut.Commands;

public class SoldeEasyCheckOutCommandValidator : AbstractValidator<SoldeEasyCheckOutCommand>
{
    public SoldeEasyCheckOutCommandValidator()
    {
        RuleFor(x => x.DateFinSejour)
            .NotEmpty().WithMessage("Date fin sejour requise");

        RuleFor(x => x.ClauseWhere)
            .MaximumLength(100).WithMessage("Clause Where max 100 caracteres")
            .When(x => !string.IsNullOrEmpty(x.ClauseWhere));

        RuleFor(x => x.NumCompteTest)
            .GreaterThan(0).WithMessage("Numero compte test invalide")
            .When(x => x.NumCompteTest.HasValue);
    }
}
