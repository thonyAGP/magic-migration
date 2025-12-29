using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CaisseDeviseConfiguration : IEntityTypeConfiguration<CaisseDevise>
{
    public void Configure(EntityTypeBuilder<CaisseDevise> builder)
    {
        builder.ToTable("caisse_devise");
        builder.HasNoKey();

        builder.Property(e => e.Utilisateur).HasColumnName("utilisateur").HasMaxLength(10);
        builder.Property(e => e.CodeDevise).HasColumnName("code_devise").HasMaxLength(4);
        builder.Property(e => e.ModePaiement).HasColumnName("mode_paiement").HasMaxLength(4);
        builder.Property(e => e.Quand).HasColumnName("quand").HasMaxLength(1);
        builder.Property(e => e.Type).HasColumnName("type").HasMaxLength(1);
        builder.Property(e => e.Quantite).HasColumnName("quantite");
    }
}
