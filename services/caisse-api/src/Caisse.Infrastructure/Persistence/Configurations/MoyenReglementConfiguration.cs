using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class MoyenReglementConfiguration : IEntityTypeConfiguration<MoyenReglement>
{
    public void Configure(EntityTypeBuilder<MoyenReglement> builder)
    {
        builder.ToTable("cafil028_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("mor_societe").HasMaxLength(2);
        builder.Property(e => e.Devise).HasColumnName("mor_devise").HasMaxLength(6);
        builder.Property(e => e.TypeOperation).HasColumnName("mor_type_operation").HasMaxLength(2);
        builder.Property(e => e.Mop).HasColumnName("mor_mop").HasMaxLength(8);
        builder.Property(e => e.Accepte).HasColumnName("mor_accepte").HasMaxLength(2);
        builder.Property(e => e.TauxDeChange).HasColumnName("mor_taux_de_change");
    }
}
