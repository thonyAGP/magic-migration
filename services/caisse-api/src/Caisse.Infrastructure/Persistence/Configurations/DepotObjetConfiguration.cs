using Caisse.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Caisse.Infrastructure.Persistence.Configurations;

public class DepotObjetConfiguration : IEntityTypeConfiguration<DepotObjet>
{
    public void Configure(EntityTypeBuilder<DepotObjet> builder)
    {
        builder.ToTable("cafil077_dat");
        builder.HasNoKey();

        builder.Property(e => e.Societe).HasColumnName("obj_societe").HasMaxLength(2);
        builder.Property(e => e.CodeObjet).HasColumnName("obj_code_objet");
        builder.Property(e => e.Libelle).HasColumnName("obj_libelle").HasMaxLength(40);
        builder.Property(e => e.CodeDroitModif).HasColumnName("obj_code_droit_modif").HasMaxLength(2);
    }
}
