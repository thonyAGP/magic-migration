using Caisse.Application.Common;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.EzCard.Queries;

/// <summary>
/// Query pour lire les cartes EzCard d'un membre
/// Migration du programme Magic Prg_80 "Card scan read"
/// </summary>
public record GetEzCardByMemberQuery(
    string Societe,
    int CodeGm,
    int Filiation
) : IRequest<GetEzCardByMemberResult>;

public record GetEzCardByMemberResult
{
    public bool Found { get; init; }
    public string Societe { get; init; } = string.Empty;
    public int CodeGm { get; init; }
    public int Filiation { get; init; }
    public List<EzCardDto> Cards { get; init; } = new();
}

public record EzCardDto
{
    public string CardCode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string StatusLibelle { get; init; } = string.Empty;
    public DateOnly? DateCreation { get; init; }
    public DateOnly? DateExpiration { get; init; }
    public bool IsActive { get; init; }
}

public class GetEzCardByMemberQueryValidator : AbstractValidator<GetEzCardByMemberQuery>
{
    public GetEzCardByMemberQueryValidator()
    {
        RuleFor(x => x.Societe)
            .NotEmpty().WithMessage("Societe is required")
            .MaximumLength(2).WithMessage("Societe must be at most 2 characters");

        RuleFor(x => x.CodeGm)
            .GreaterThan(0).WithMessage("CodeGm must be greater than 0");

        RuleFor(x => x.Filiation)
            .GreaterThanOrEqualTo(0).WithMessage("Filiation must be >= 0");
    }
}

public class GetEzCardByMemberQueryHandler : IRequestHandler<GetEzCardByMemberQuery, GetEzCardByMemberResult>
{
    private readonly ICaisseDbContext _context;

    public GetEzCardByMemberQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<GetEzCardByMemberResult> Handle(
        GetEzCardByMemberQuery request,
        CancellationToken cancellationToken)
    {
        var cards = await _context.EzCards
            .AsNoTracking()
            .Where(c =>
                c.Societe == request.Societe &&
                c.CodeGm == request.CodeGm &&
                c.Filiation == request.Filiation)
            .OrderByDescending(c => c.DateCreation)
            .ToListAsync(cancellationToken);

        if (!cards.Any())
        {
            return new GetEzCardByMemberResult
            {
                Found = false,
                Societe = request.Societe,
                CodeGm = request.CodeGm,
                Filiation = request.Filiation
            };
        }

        return new GetEzCardByMemberResult
        {
            Found = true,
            Societe = request.Societe,
            CodeGm = request.CodeGm,
            Filiation = request.Filiation,
            Cards = cards.Select(c => new EzCardDto
            {
                CardCode = c.CardCode,
                Status = c.Status,
                StatusLibelle = GetStatusLibelle(c.Status),
                DateCreation = c.DateCreation != null && c.DateCreation.Length == 8
                    ? ParseDate(c.DateCreation)
                    : null,
                DateExpiration = c.DateExpiration != null && c.DateExpiration.Length == 8
                    ? ParseDate(c.DateExpiration)
                    : null,
                IsActive = c.Status != "O" && c.Status != "D" // O=Opposition, D=Desactive
            }).ToList()
        };
    }

    private static string GetStatusLibelle(string status) => status switch
    {
        "A" => "Actif",
        "O" => "Opposition",
        "D" => "Desactive",
        "P" => "En attente",
        "E" => "Expire",
        _ => "Inconnu"
    };

    private static DateOnly? ParseDate(string dateStr)
    {
        if (string.IsNullOrEmpty(dateStr) || dateStr.Length != 8) return null;
        if (int.TryParse(dateStr.Substring(0, 4), out int year) &&
            int.TryParse(dateStr.Substring(4, 2), out int month) &&
            int.TryParse(dateStr.Substring(6, 2), out int day) &&
            year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31)
        {
            try
            {
                return new DateOnly(year, month, day);
            }
            catch
            {
                return null;
            }
        }
        return null;
    }
}
