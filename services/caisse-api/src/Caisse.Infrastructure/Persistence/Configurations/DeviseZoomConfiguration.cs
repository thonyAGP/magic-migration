using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class DeviseZoomConfiguration : IEntityTypeConfiguration<DeviseZoom>
{
    public void Configure(EntityTypeBuilder<DeviseZoom> builder)
    {
        builder.ToTable("cafil068_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("dev_societe").HasMaxLength(2);
        builder.Property(e => e.CodeEnCours).HasColumnName("dev_code_en_cours").HasMaxLength(2);
        builder.Property(e => e.CodeDevise).HasColumnName("dev_code_devise").HasMaxLength(6);
        builder.Property(e => e.Numero).HasColumnName("dev_numero");
        builder.Property(e => e.Taux).HasColumnName("dev_taux").HasColumnType("float");
        builder.Property(e => e.Libelle).HasColumnName("dev_libelle").HasMaxLength(40);
    }
}
