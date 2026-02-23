using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class InitialisationConfiguration : IEntityTypeConfiguration<Initialisation>
{
    public void Configure(EntityTypeBuilder<Initialisation> builder)
    {
        builder.ToTable("cafil047_dat");
        builder.HasNoKey();

        builder.Property(e => e.CodeVillage3).HasColumnName("ini_code_village_3").HasMaxLength(6);
        builder.Property(e => e.NomVillage).HasColumnName("ini_nom_village").HasMaxLength(60);
        builder.Property(e => e.Telephone).HasColumnName("ini_telephone").HasMaxLength(30);
        builder.Property(e => e.Fax).HasColumnName("ini_fax").HasMaxLength(30);
        builder.Property(e => e.DeviseLocale).HasColumnName("ini_devise_locale").HasMaxLength(6);
        builder.Property(e => e.NbreDecimales).HasColumnName("ini_nbre_decimales");
    }
}
