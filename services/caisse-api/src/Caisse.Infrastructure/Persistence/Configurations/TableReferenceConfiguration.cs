using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class TableReferenceConfiguration : IEntityTypeConfiguration<TableReference>
{
    public void Configure(EntityTypeBuilder<TableReference> builder)
    {
        builder.ToTable("cafil045_dat");
        builder.HasNoKey();

        builder.Property(e => e.NomTable).HasColumnName("tab_nom_table").HasMaxLength(10);
        builder.Property(e => e.NomInterneCode).HasColumnName("tab_nom_interne_code").HasMaxLength(10);
        builder.Property(e => e.CodeAlpha5).HasColumnName("tab_code_alpha5").HasMaxLength(10);
        builder.Property(e => e.CodeNumeric6).HasColumnName("tab_code_numeric6");
        builder.Property(e => e.Classe).HasColumnName("tab_classe").HasMaxLength(12);
        builder.Property(e => e.ValeurNumerique).HasColumnName("tab_valeur_numerique").HasPrecision(14, 3);
        builder.Property(e => e.Libelle20).HasColumnName("tab_libelle20").HasMaxLength(40);
        builder.Property(e => e.Libelle10Upper).HasColumnName("tab_libelle10_upper").HasMaxLength(20);
        builder.Property(e => e.CodeDroitModif).HasColumnName("tab_code_droit_modif").HasMaxLength(2);
        builder.Property(e => e.RemiseAutorisee).HasColumnName("tab_remise_autorisee");
        builder.Property(e => e.PrixAutorise).HasColumnName("tab_prix_autorise");
        builder.Property(e => e.ImprimerTva).HasColumnName("tab_imprimer_tva");
        builder.Property(e => e.ActiverBarLimit).HasColumnName("tab_activer_bar_limit");
        builder.Property(e => e.ActiverCreditConso).HasColumnName("tab_activer_credit_conso");
        builder.Property(e => e.TypeService).HasColumnName("tab_type_service").HasMaxLength(2);
        builder.Property(e => e.PourcentCommission).HasColumnName("tab_pourcent_commission").HasPrecision(5, 2);
        builder.Property(e => e.SaleLabelModifiable).HasColumnName("tab_sale_label_modifiable");
        builder.Property(e => e.VoirTel).HasColumnName("tab_voir_tel");
    }
}
