using Caisse.Application.Common;
using FluentValidation;
using MediatR;

namespace Caisse.Application.EzCard.Queries;

/// <summary>
/// Query pour valider les caracteres d'une chaine
/// Migration du programme Magic Prg_84 "CARACT_INTERDIT" - Verification Chaine
/// Validation de caracteres interdits dans une chaine
/// </summary>
public record ValidateCharactersQuery(
    string Text,
    bool AllowNumbers = true,
    bool AllowSpecialChars = false
) : IRequest<ValidateCharactersResult>;

public record ValidateCharactersResult(
    bool IsValid,
    string? InvalidCharacter = null,
    int? Position = null,
    string? Error = null);

public class ValidateCharactersQueryValidator : AbstractValidator<ValidateCharactersQuery>
{
    public ValidateCharactersQueryValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty().WithMessage("Text is required")
            .MaximumLength(500).WithMessage("Text must be at most 500 characters");
    }
}

public class ValidateCharactersQueryHandler : IRequestHandler<ValidateCharactersQuery, ValidateCharactersResult>
{
    public ValidateCharactersQueryHandler()
    {
    }

    public Task<ValidateCharactersResult> Handle(
        ValidateCharactersQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // List of allowed characters
            // Based on Magic Prg_84 logic: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-.{space}{quote}
            var allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-.' ";

            if (request.AllowNumbers)
            {
                allowedChars += "0123456789";
            }

            if (request.AllowSpecialChars)
            {
                allowedChars += "@#$%&*()[]{}";
            }

            for (int i = 0; i < request.Text.Length; i++)
            {
                var c = request.Text[i];
                if (!allowedChars.Contains(c))
                {
                    return Task.FromResult(new ValidateCharactersResult(
                        false,
                        InvalidCharacter: c.ToString(),
                        Position: i + 1,
                        Error: $"Caractere interdit '{c}' a la position {i + 1}"));
                }
            }

            return Task.FromResult(new ValidateCharactersResult(true));
        }
        catch (Exception ex)
        {
            return Task.FromResult(new ValidateCharactersResult(false, Error: ex.Message));
        }
    }
}
