using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class CaisseSessionArticleConfiguration : IEntityTypeConfiguration<CaisseSessionArticle>
{
    public void Configure(EntityTypeBuilder<CaisseSessionArticle> builder)
    {
        builder.ToTable("caisse_session_article");
        builder.HasNoKey();

        builder.Property(e => e.Utilisateur).HasColumnName("utilisateur").HasMaxLength(10);
        builder.Property(e => e.ChronoSession).HasColumnName("chrono_session");
        builder.Property(e => e.ChronoDetail).HasColumnName("chrono_detail");
        builder.Property(e => e.CodeArticle).HasColumnName("code_article");
        builder.Property(e => e.LibelleArticle).HasColumnName("libelle_article").HasMaxLength(100);
        builder.Property(e => e.PrixUnitaire).HasColumnName("prix_unitaire");
        builder.Property(e => e.Quantite).HasColumnName("quantite");
        builder.Property(e => e.Montant).HasColumnName("montant");
        builder.Property(e => e.Date).HasColumnName("date").HasMaxLength(8);
        builder.Property(e => e.Heure).HasColumnName("heure").HasMaxLength(6);

        builder.Ignore(e => e.Session);
    }
}
