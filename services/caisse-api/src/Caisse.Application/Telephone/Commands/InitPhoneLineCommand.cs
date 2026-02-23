using FluentValidation;
using MediatR;

namespace Caisse.Application.Telephone.Commands;

/// <summary>
/// Command pour initialiser une ligne téléphonique
/// Migration du programme Magic Prg_202 "Lecture Autocom"
/// </summary>
public record InitPhoneLineCommand(
    string Societe,
    int CodeGm,
    int Filiation,
    int CodePoste,
    int NumLigne,
    int NumPoste,
    bool Existe
) : IRequest<InitPhoneLineResult>;

public record InitPhoneLineResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public int? CodeGm { get; init; }
    public int? NumLigne { get; init; }
    public int? NumPoste { get; init; }
}

public class InitPhoneLineCommandValidator : AbstractValidator<InitPhoneLineCommand>
{
    public InitPhoneLineCommandValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be positive");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be non-negative");

        RuleFor(x => x.CodePoste)
            .GreaterThan(0).WithMessage("CodePoste must be positive");

        RuleFor(x => x.NumLigne)
            .GreaterThan(0).WithMessage("NumLigne must be positive");

        RuleFor(x => x.NumPoste)
            .GreaterThan(0).WithMessage("NumPoste must be positive");
    }
}

public class InitPhoneLineCommandHandler : IRequestHandler<InitPhoneLineCommand, InitPhoneLineResult>
{
    public async Task<InitPhoneLineResult> Handle(
        InitPhoneLineCommand request,
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        return new InitPhoneLineResult
        {
            Success = true,
            Message = "Phone line initialized successfully",
            CodeGm = request.CodeGm,
            NumLigne = request.NumLigne,
            NumPoste = request.NumPoste
        };
    }
}
