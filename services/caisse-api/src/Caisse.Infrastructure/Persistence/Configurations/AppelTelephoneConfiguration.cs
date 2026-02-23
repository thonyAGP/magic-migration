using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class AppelTelephoneConfiguration : IEntityTypeConfiguration<AppelTelephone>
{
    public void Configure(EntityTypeBuilder<AppelTelephone> builder)
    {
        builder.ToTable("appels_telephone_dat");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("id");

        builder.Property(a => a.Societe)
            .HasColumnName("societe")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(a => a.CodeAutocom)
            .HasColumnName("code_autocom");

        builder.Property(a => a.DateAppel)
            .HasColumnName("date_appel");

        builder.Property(a => a.HeureAppel)
            .HasColumnName("heure_appel")
            .HasMaxLength(8);

        builder.Property(a => a.NumeroAppele)
            .HasColumnName("numero_appele")
            .HasMaxLength(50);

        builder.Property(a => a.TypeAppel)
            .HasColumnName("type_appel")
            .HasMaxLength(1);

        builder.Property(a => a.DureeSecondes)
            .HasColumnName("duree_secondes");

        builder.Property(a => a.Montant)
            .HasColumnName("montant")
            .HasPrecision(18, 2);

        builder.Property(a => a.Etat)
            .HasColumnName("etat")
            .HasMaxLength(1);

        builder.Property(a => a.NomVillage)
            .HasColumnName("nom_village")
            .HasMaxLength(100);

        builder.Property(a => a.NomClient)
            .HasColumnName("nom_client")
            .HasMaxLength(100);

        builder.Property(a => a.PrenomClient)
            .HasColumnName("prenom_client")
            .HasMaxLength(100);

        builder.Property(a => a.CodeGm)
            .HasColumnName("code_gm");

        builder.Property(a => a.Filiation)
            .HasColumnName("filiation");

        builder.HasIndex(a => new { a.Societe, a.CodeAutocom, a.DateAppel });
    }
}
