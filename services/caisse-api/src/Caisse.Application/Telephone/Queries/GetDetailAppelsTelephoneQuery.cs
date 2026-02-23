using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Telephone.Queries;

/// <summary>
/// Query to get phone call details for an autocom code (Prg_211)
/// </summary>
public record GetDetailAppelsTelephoneQuery(
    string Societe,
    int CodeAutocom,
    int? NbDecimales = 2,
    string? NomVillage = null
) : IRequest<DetailAppelsTelephoneResult>;

public record DetailAppelsTelephoneResult(
    bool Found,
    int CodeAutocom,
    string NomVillage,
    string NomClient,
    string PrenomClient,
    List<DetailAppelDto> Appels,
    decimal TotalMontant,
    int NombreAppels
);

public record DetailAppelDto(
    DateTime DateAppel,
    string Heure,
    string NumeroAppele,
    string TypeAppel,
    int DureeSecondes,
    decimal Montant,
    string Statut
);

public class GetDetailAppelsTelephoneQueryHandler : IRequestHandler<GetDetailAppelsTelephoneQuery, DetailAppelsTelephoneResult>
{
    private readonly ICaisseDbContext _context;

    public GetDetailAppelsTelephoneQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<DetailAppelsTelephoneResult> Handle(
        GetDetailAppelsTelephoneQuery request,
        CancellationToken cancellationToken)
    {
        // Query the phone calls table (appels_telephone_dat)
        var appels = await _context.AppelsTelephone
            .Where(a => a.Societe == request.Societe && a.CodeAutocom == request.CodeAutocom)
            .OrderByDescending(a => a.DateAppel)
            .ToListAsync(cancellationToken);

        if (!appels.Any())
        {
            return new DetailAppelsTelephoneResult(
                Found: false,
                CodeAutocom: request.CodeAutocom,
                NomVillage: request.NomVillage ?? "",
                NomClient: "",
                PrenomClient: "",
                Appels: new List<DetailAppelDto>(),
                TotalMontant: 0,
                NombreAppels: 0
            );
        }

        var firstAppel = appels.First();
        var detailAppels = appels.Select(a => new DetailAppelDto(
            DateAppel: a.DateAppel,
            Heure: a.HeureAppel ?? "",
            NumeroAppele: a.NumeroAppele ?? "",
            TypeAppel: a.TypeAppel ?? "",
            DureeSecondes: a.DureeSecondes,
            Montant: a.Montant,
            Statut: a.Etat ?? ""
        )).ToList();

        return new DetailAppelsTelephoneResult(
            Found: true,
            CodeAutocom: request.CodeAutocom,
            NomVillage: request.NomVillage ?? firstAppel.NomVillage ?? "",
            NomClient: firstAppel.NomClient ?? "",
            PrenomClient: firstAppel.PrenomClient ?? "",
            Appels: detailAppels,
            TotalMontant: appels.Sum(a => a.Montant),
            NombreAppels: appels.Count
        );
    }
}
