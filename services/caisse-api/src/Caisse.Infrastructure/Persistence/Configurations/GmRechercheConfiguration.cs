using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class GmRechercheConfiguration : IEntityTypeConfiguration<GmRecherche>
{
    public void Configure(EntityTypeBuilder<GmRecherche> builder)
    {
        builder.ToTable("cafil008_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("gmr_societe").HasMaxLength(2);
        builder.Property(e => e.CodeGm).HasColumnName("gmr_code_gm");
        builder.Property(e => e.FiliationVillag).HasColumnName("gmr_filiation_villag");
        builder.Property(e => e.Acces).HasColumnName("gmr_acces").HasMaxLength(2);
        builder.Property(e => e.TypeDeClient).HasColumnName("gmr_type_de_client").HasMaxLength(2);
        builder.Property(e => e.NumClub).HasColumnName("gmr_num__club");
        builder.Property(e => e.LettreControle).HasColumnName("gmr_lettre_controle").HasMaxLength(2);
        builder.Property(e => e.FiliationClub).HasColumnName("gmr_filiation_club");
        builder.Property(e => e.Nom).HasColumnName("gmr_nom__30_").HasMaxLength(60);
        builder.Property(e => e.Prenom).HasColumnName("gmr_prenom__8_").HasMaxLength(20);
        builder.Property(e => e.Sexe).HasColumnName("gmr_sexe").HasMaxLength(2);
        builder.Property(e => e.Age).HasColumnName("gmr_age").HasMaxLength(2);
        builder.Property(e => e.LangueParlee).HasColumnName("gmr_langue_parlee").HasMaxLength(4);
        builder.Property(e => e.Qualite).HasColumnName("gmr_qualite").HasMaxLength(4);
    }
}
