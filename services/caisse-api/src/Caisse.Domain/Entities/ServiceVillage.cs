namespace Caisse.Domain.Entities;

/// <summary>
/// Table caisse_ref_simp_service - Services simplifiés disponibles au village
/// Pour Prg_265: Zoom services village
/// </summary>
public class ServiceVillage
{
    public string CodeService { get; set; } = null!;
    public int SousImputation { get; set; }
}
