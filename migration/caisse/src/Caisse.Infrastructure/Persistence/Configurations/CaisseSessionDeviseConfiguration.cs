using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CaisseSessionDeviseConfiguration : IEntityTypeConfiguration<CaisseSessionDevise>
{
    public void Configure(EntityTypeBuilder<CaisseSessionDevise> builder)
    {
        builder.ToTable("caisse_session_devise");
        builder.HasNoKey();

        builder.Property(e => e.Utilisateur).HasColumnName("utilisateur").HasMaxLength(10);
        builder.Property(e => e.ChronoSession).HasColumnName("chrono_session");
        builder.Property(e => e.ChronoDetail).HasColumnName("chrono_detail");
        builder.Property(e => e.Type).HasColumnName("type").HasMaxLength(1);
        builder.Property(e => e.Quand).HasColumnName("quand").HasMaxLength(1);
        builder.Property(e => e.CodeDevise).HasColumnName("code_devise").HasMaxLength(4);
        builder.Property(e => e.ModePaiement).HasColumnName("mode_paiement").HasMaxLength(4);
        builder.Property(e => e.Quantite).HasColumnName("quantite");
        builder.Property(e => e.Date).HasColumnName("date").HasMaxLength(8);
        builder.Property(e => e.Heure).HasColumnName("heure").HasMaxLength(6);

        builder.Ignore(e => e.Session);
    }
}
