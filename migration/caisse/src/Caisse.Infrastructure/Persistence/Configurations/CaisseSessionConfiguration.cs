using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CaisseSessionConfiguration : IEntityTypeConfiguration<CaisseSession>
{
    public void Configure(EntityTypeBuilder<CaisseSession> builder)
    {
        builder.ToTable("caisse_session");

        builder.HasKey(x => new { x.Utilisateur, x.Chrono });

        builder.Property(x => x.Utilisateur)
            .HasColumnName("utilisateur")
            .HasMaxLength(8)  // Actual DB size
            .IsRequired();

        builder.Property(x => x.Chrono)
            .HasColumnName("chrono")
            .IsRequired();

        builder.Property(x => x.DateDebutSession)
            .HasColumnName("date_debut_session")
            .HasMaxLength(8)
            .IsFixedLength()
            .IsRequired();

        builder.Property(x => x.HeureDebutSession)
            .HasColumnName("heure_debut_session")
            .HasMaxLength(6)
            .IsFixedLength()
            .IsRequired();

        builder.Property(x => x.DateFinSession)
            .HasColumnName("date_fin_session")
            .HasMaxLength(8)
            .IsFixedLength()
            .IsRequired();

        builder.Property(x => x.HeureFinSession)
            .HasColumnName("heure_fin_session")
            .HasMaxLength(6)
            .IsFixedLength()
            .IsRequired();

        builder.Property(x => x.DateComptable)
            .HasColumnName("date_comptable")
            .HasMaxLength(8)
            .IsFixedLength()
            .IsRequired();

        builder.Property(x => x.Pointage)
            .HasColumnName("pointage")
            .IsRequired();

        // Relationships - HasMany with Details (has key)
        builder.HasMany(x => x.Details)
            .WithOne(x => x.Session)
            .HasForeignKey(x => new { x.Utilisateur, x.ChronoSession })
            .HasPrincipalKey(x => new { x.Utilisateur, x.Chrono });

        // Ignore navigation to keyless entities
        builder.Ignore(x => x.Articles);
        builder.Ignore(x => x.Devises);
    }
}
