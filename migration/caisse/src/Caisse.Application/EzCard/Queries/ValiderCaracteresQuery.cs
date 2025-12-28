using FluentValidation;
using MediatR;

namespace Caisse.Application.EzCard.Queries;

/// <summary>
/// Query pour valider les caracteres interdits dans une chaine
/// Migration du programme Magic Prg_84 "SP Caracteres Interdits" (PUBLIC: CARACT_INTERDIT)
/// </summary>
public record ValiderCaracteresQuery(
    string Texte,
    string? CaracteresInterdits,
    bool StrictMode
) : IRequest<ValiderCaracteresResult>;

public record ValiderCaracteresResult
{
    public bool IsValid { get; init; }
    public string TexteOriginal { get; init; } = string.Empty;
    public string TexteNettoye { get; init; } = string.Empty;
    public List<char> CaracteresDetectes { get; init; } = new();
    public string Message { get; init; } = string.Empty;
}

public class ValiderCaracteresQueryValidator : AbstractValidator<ValiderCaracteresQuery>
{
    public ValiderCaracteresQueryValidator()
    {
        RuleFor(x => x.Texte)
            .NotNull().WithMessage("Texte cannot be null");
    }
}

public class ValiderCaracteresQueryHandler : IRequestHandler<ValiderCaracteresQuery, ValiderCaracteresResult>
{
    // Caracteres interdits par defaut (Magic: caracteres speciaux non autorises)
    private const string DefaultForbiddenChars = "<>\"'&;|\\`${}[]";

    public Task<ValiderCaracteresResult> Handle(
        ValiderCaracteresQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.Texte))
        {
            return Task.FromResult(new ValiderCaracteresResult
            {
                IsValid = true,
                TexteOriginal = request.Texte ?? "",
                TexteNettoye = request.Texte ?? "",
                Message = "Texte vide"
            });
        }

        var forbiddenChars = string.IsNullOrEmpty(request.CaracteresInterdits)
            ? DefaultForbiddenChars
            : request.CaracteresInterdits;

        var detectedChars = new List<char>();
        var cleanedText = new System.Text.StringBuilder();

        foreach (char c in request.Texte)
        {
            if (forbiddenChars.Contains(c))
            {
                detectedChars.Add(c);
                if (!request.StrictMode)
                {
                    // En mode non-strict, remplacer par un espace
                    cleanedText.Append(' ');
                }
            }
            else
            {
                cleanedText.Append(c);
            }
        }

        var isValid = detectedChars.Count == 0;

        return Task.FromResult(new ValiderCaracteresResult
        {
            IsValid = isValid,
            TexteOriginal = request.Texte,
            TexteNettoye = cleanedText.ToString(),
            CaracteresDetectes = detectedChars.Distinct().ToList(),
            Message = isValid
                ? "Aucun caractere interdit detecte"
                : $"Caracteres interdits detectes: {string.Join(", ", detectedChars.Distinct().Select(c => $"'{c}'"))}"
        });
    }
}
