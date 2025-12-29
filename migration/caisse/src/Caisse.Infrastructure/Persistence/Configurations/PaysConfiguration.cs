using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class PaysConfiguration : IEntityTypeConfiguration<Pays>
{
    public void Configure(EntityTypeBuilder<Pays> builder)
    {
        builder.ToTable("cafil097_dat");
        builder.HasNoKey();

        builder.Property(e => e.CodeLangue).HasColumnName("code_langue").HasMaxLength(2);
        builder.Property(e => e.Libelle).HasColumnName("libelle").HasMaxLength(100);
        builder.Property(e => e.CodePays).HasColumnName("code_pays").HasMaxLength(4);
        builder.Property(e => e.LangueParlee).HasColumnName("langue_parlee").HasMaxLength(4);
        builder.Property(e => e.Monnaie).HasColumnName("monnaie").HasMaxLength(8);
        builder.Property(e => e.CodeTelephone).HasColumnName("code_telephone");
        builder.Property(e => e.FeteNationale).HasColumnName("fete_nationale").HasMaxLength(10);
        builder.Property(e => e.FuseauHoraire).HasColumnName("fuseau_horaire");
        builder.Property(e => e.DecalageHoraire).HasColumnName("decalage_horaire");
        builder.Property(e => e.Inscription).HasColumnName("inscription").HasMaxLength(6);
        builder.Property(e => e.AccesStandard).HasColumnName("acces_standard").HasMaxLength(2);
        builder.Property(e => e.AccesPlanning).HasColumnName("acces_planning").HasMaxLength(2);
        builder.Property(e => e.AccesCaisse).HasColumnName("acces_caisse").HasMaxLength(2);
        builder.Property(e => e.CodePaysNormalise).HasColumnName("code_pays_normalise").HasMaxLength(6);
    }
}
