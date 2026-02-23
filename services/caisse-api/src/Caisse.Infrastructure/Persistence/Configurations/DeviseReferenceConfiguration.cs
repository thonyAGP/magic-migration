using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class DeviseReferenceConfiguration : IEntityTypeConfiguration<DeviseReference>
{
    public void Configure(EntityTypeBuilder<DeviseReference> builder)
    {
        builder.ToTable("devisein_par");
        builder.HasNoKey();

        builder.Property(e => e.CodeDevise).HasColumnName("code_devise").HasMaxLength(4);
        builder.Property(e => e.Libelle).HasColumnName("libelle").HasMaxLength(50);
        builder.Property(e => e.NombreDeDecimales).HasColumnName("nombre_de_decimales");
        builder.Property(e => e.Taux).HasColumnName("taux");
    }
}
