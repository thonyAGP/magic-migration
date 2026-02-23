using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class LigneTelephoneConfiguration : IEntityTypeConfiguration<LigneTelephone>
{
    public void Configure(EntityTypeBuilder<LigneTelephone> builder)
    {
        builder.ToTable("pi_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe)
            .HasColumnName("societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.CodeGm)
            .HasColumnName("code_gm");

        builder.Property(e => e.Filiation)
            .HasColumnName("filiation");

        builder.Property(e => e.NumeroPoste)
            .HasColumnName("numero_poste")
            .HasMaxLength(10);

        builder.Property(e => e.NumeroLigne)
            .HasColumnName("numero_ligne")
            .HasMaxLength(10);

        builder.Property(e => e.CodeAutocom)
            .HasColumnName("code_autocom")
            .HasMaxLength(10);

        builder.Property(e => e.Etat)
            .HasColumnName("etat")
            .HasMaxLength(1);

        builder.Property(e => e.DateOuverture)
            .HasColumnName("date_ouverture");

        builder.Property(e => e.HeureOuverture)
            .HasColumnName("heure_ouverture");

        builder.Property(e => e.DateFermeture)
            .HasColumnName("date_fermeture");

        builder.Property(e => e.HeureFermeture)
            .HasColumnName("heure_fermeture");

        builder.Property(e => e.OperateurOuverture)
            .HasColumnName("operateur_ouverture")
            .HasMaxLength(10);

        builder.Property(e => e.OperateurFermeture)
            .HasColumnName("operateur_fermeture")
            .HasMaxLength(10);

        builder.Property(e => e.NumChambre)
            .HasColumnName("num_chambre")
            .HasMaxLength(10);
    }
}
