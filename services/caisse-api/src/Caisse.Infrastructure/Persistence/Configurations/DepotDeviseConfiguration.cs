using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class DepotDeviseConfiguration : IEntityTypeConfiguration<DepotDevise>
{
    public void Configure(EntityTypeBuilder<DepotDevise> builder)
    {
        builder.ToTable("cafil078_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("ddv_societe").HasMaxLength(2);
        builder.Property(e => e.MoyenPaiement).HasColumnName("ddv_moyen_paiement").HasMaxLength(10);
        builder.Property(e => e.Libelle).HasColumnName("ddv_libelle").HasMaxLength(40);
        builder.Property(e => e.CodeModif).HasColumnName("ddv_code_modif").HasMaxLength(2);
    }
}
