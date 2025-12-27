using Caisse.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Caisse.Application.Parametres.Queries;

public record GetParametresQuery(string? Cle = null) : IRequest<ParametresDto?>;

public record ParametresDto(
    string Cle,
    string MopCmp,
    string ClassOd,
    int CompteEcartGain,
    int CompteEcartPerte,
    bool SupprimeComptesFinCentralise,
    bool SupprimeMopCentralise,
    int ArticleCompteDerniereMinute,
    int CompteApproCaisse,
    int CompteRemiseCaisse,
    int CompteFdrReceptionniste,
    int CompteBilanMini1,
    int CompteBilanMaxi1,
    int SessionsCaisseAConserver,
    int ComptagesCoffreAConserver,
    int NumTerminalCaisseMini,
    int NumTerminalCaisseMaxi,
    int CompteVersretraitNonCash,
    int CompteVersretraitCash,
    string SeparateurDecimalExcel,
    bool InitialisationAutomatique,
    string GestionCaisseAvec2Coffres,
    int CompteBoutique,
    string ClotureAutomatique,
    int ActiviteBoutique,
    bool CodeABarresIms);

public class GetParametresQueryHandler : IRequestHandler<GetParametresQuery, ParametresDto?>
{
    private readonly ICaisseDbContext _context;

    public GetParametresQueryHandler(ICaisseDbContext context)
    {
        _context = context;
    }

    public async Task<ParametresDto?> Handle(
        GetParametresQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Parametres.AsQueryable();

        if (!string.IsNullOrEmpty(request.Cle))
            query = query.Where(p => p.Cle == request.Cle);

        var param = await query.FirstOrDefaultAsync(cancellationToken);

        if (param == null)
            return null;

        return new ParametresDto(
            param.Cle,
            param.MopCmp,
            param.ClassOd,
            param.CompteEcartGain,
            param.CompteEcartPerte,
            param.SupprimeComptesFinCentralise,
            param.SupprimeMopCentralise,
            param.ArticleCompteDerniereMinute,
            param.CompteApproCaisse,
            param.CompteRemiseCaisse,
            param.CompteFdrReceptionniste,
            param.CompteBilanMini1,
            param.CompteBilanMaxi1,
            param.SessionsCaisseAConserver,
            param.ComptagesCoffreAConserver,
            param.NumTerminalCaisseMini,
            param.NumTerminalCaisseMaxi,
            param.CompteVersretraitNonCash,
            param.CompteVersretraitCash,
            param.SeparateurDecimalExcel,
            param.InitialisationAutomatique,
            param.GestionCaisseAvec2Coffres,
            param.CompteBoutique,
            param.ClotureAutomatique,
            param.ActiviteBoutique,
            param.CodeABarresIms);
    }
}
