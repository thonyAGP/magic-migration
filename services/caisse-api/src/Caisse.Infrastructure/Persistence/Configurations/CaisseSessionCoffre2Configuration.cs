using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CaisseSessionCoffre2Configuration : IEntityTypeConfiguration<CaisseSessionCoffre2>
{
    public void Configure(EntityTypeBuilder<CaisseSessionCoffre2> builder)
    {
        builder.ToTable("caisse_session_coffre2");
        builder.HasNoKey();

        builder.Property(e => e.DateOuvertureCaisse90).HasColumnName("date_ouverture_caisse_90").HasMaxLength(8);
        builder.Property(e => e.HeureOuvertureCaisse90).HasColumnName("heure_ouverture_caisse_90").HasMaxLength(6);
        builder.Property(e => e.Chrono).HasColumnName("chrono");
        builder.Property(e => e.Utilisateur).HasColumnName("utilisateur").HasMaxLength(10);
    }
}
