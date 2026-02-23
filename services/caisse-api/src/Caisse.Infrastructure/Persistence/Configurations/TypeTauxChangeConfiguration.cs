using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class TypeTauxChangeConfiguration : IEntityTypeConfiguration<TypeTauxChange>
{
    public void Configure(EntityTypeBuilder<TypeTauxChange> builder)
    {
        builder.ToTable("cafil102_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("ttc_societe").HasMaxLength(2);
        builder.Property(e => e.Code).HasColumnName("ttc_code");
        builder.Property(e => e.Utilise).HasColumnName("ttc_utilise__").HasMaxLength(2);
        builder.Property(e => e.Libelle).HasColumnName("ttc_libelle").HasMaxLength(30);
        builder.Property(e => e.Modifiable).HasColumnName("ttc_modifiable").HasMaxLength(2);
    }
}
