using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class VillageConfiguration : IEntityTypeConfiguration<Village>
{
    public void Configure(EntityTypeBuilder<Village> builder)
    {
        builder.ToTable("pms_village");

        builder.HasKey(e => new { e.Societe, e.CodeVillage });

        builder.Property(e => e.Societe)
            .HasColumnName("vil_societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.CodeVillage)
            .HasColumnName("vil_code_village")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(e => e.NomVillage)
            .HasColumnName("vil_nom_village")
            .HasMaxLength(50);

        builder.Property(e => e.Adresse1)
            .HasColumnName("vil_adresse1")
            .HasMaxLength(100);

        builder.Property(e => e.Adresse2)
            .HasColumnName("vil_adresse2")
            .HasMaxLength(100);

        builder.Property(e => e.CodePostal)
            .HasColumnName("vil_code_postal")
            .HasMaxLength(10);

        builder.Property(e => e.Ville)
            .HasColumnName("vil_ville")
            .HasMaxLength(50);

        builder.Property(e => e.CodePays)
            .HasColumnName("vil_code_pays")
            .HasMaxLength(4);

        builder.Property(e => e.Telephone)
            .HasColumnName("vil_telephone")
            .HasMaxLength(20);

        builder.Property(e => e.Email)
            .HasColumnName("vil_email")
            .HasMaxLength(100);

        builder.Property(e => e.DeviseLocale)
            .HasColumnName("vil_devise_locale")
            .HasMaxLength(6);

        builder.Property(e => e.NbDecimales)
            .HasColumnName("vil_nb_decimales");

        builder.Property(e => e.VillageAuTel)
            .HasColumnName("vil_village_au_tel");

        builder.Property(e => e.TelAuCam)
            .HasColumnName("vil_tel_au_cam");

        builder.Property(e => e.VillageBiBop)
            .HasColumnName("vil_village_bibop");

        builder.Property(e => e.TypeEtablissement)
            .HasColumnName("vil_type_etablissement")
            .HasMaxLength(4);
    }
}
