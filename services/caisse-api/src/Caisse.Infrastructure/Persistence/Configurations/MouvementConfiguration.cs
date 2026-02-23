using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class MouvementConfiguration : IEntityTypeConfiguration<Mouvement>
{
    public void Configure(EntityTypeBuilder<Mouvement> builder)
    {
        builder.ToTable("mouvement_dat");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("mvt_id")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.Societe)
            .HasColumnName("mvt_societe")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(e => e.CodeGm)
            .HasColumnName("mvt_code_gm");

        builder.Property(e => e.Filiation)
            .HasColumnName("mvt_filiation");

        builder.Property(e => e.DateComptable)
            .HasColumnName("mvt_date_comptable");

        builder.Property(e => e.HeureOperation)
            .HasColumnName("mvt_heure_operation");

        builder.Property(e => e.TypeMouvement)
            .HasColumnName("mvt_type_mouvement")
            .HasMaxLength(2);

        builder.Property(e => e.CodeDevise)
            .HasColumnName("mvt_code_devise")
            .HasMaxLength(6);

        builder.Property(e => e.Montant)
            .HasColumnName("mvt_montant");

        builder.Property(e => e.MontantDeviseLocale)
            .HasColumnName("mvt_montant_devise_locale");

        builder.Property(e => e.TauxChange)
            .HasColumnName("mvt_taux_change");

        builder.Property(e => e.CodeMop)
            .HasColumnName("mvt_code_mop")
            .HasMaxLength(10);

        builder.Property(e => e.Operateur)
            .HasColumnName("mvt_operateur")
            .HasMaxLength(16);

        builder.Property(e => e.Reference)
            .HasColumnName("mvt_reference")
            .HasMaxLength(50);

        builder.Property(e => e.Commentaire)
            .HasColumnName("mvt_commentaire")
            .HasMaxLength(100);

        builder.Property(e => e.NumeroTicket)
            .HasColumnName("mvt_numero_ticket");

        builder.Property(e => e.CodeService)
            .HasColumnName("mvt_code_service")
            .HasMaxLength(10);

        builder.Property(e => e.EtatMouvement)
            .HasColumnName("mvt_etat_mouvement")
            .HasMaxLength(2);

        builder.Property(e => e.DateAnnulation)
            .HasColumnName("mvt_date_annulation");

        // Indexes for common queries
        builder.HasIndex(e => new { e.Societe, e.CodeGm, e.Filiation, e.DateComptable });
        builder.HasIndex(e => new { e.Societe, e.DateComptable });
    }
}
