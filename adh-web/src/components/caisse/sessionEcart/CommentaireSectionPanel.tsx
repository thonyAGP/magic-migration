import { cn } from "@/lib/utils";
import { useSessionEcartStore } from "@/stores/sessionEcartStore";

interface CommentaireSectionPanelProps {
  className?: string;
}

export const CommentaireSectionPanel = ({ className }: CommentaireSectionPanelProps) => {
  const commentaire = useSessionEcartStore((s) => s.commentaire);
  const commentaireDevise = useSessionEcartStore((s) => s.commentaireDevise);
  const montantEcart = useSessionEcartStore((s) => s.montantEcart);
  const seuilAlerte = useSessionEcartStore((s) => s.seuilAlerte);
  const setCommentaire = useSessionEcartStore((s) => s.setCommentaire);
  const setCommentaireDevise = useSessionEcartStore((s) => s.setCommentaireDevise);

  const ecartExceedsThreshold = Math.abs(montantEcart) > seuilAlerte;
  const commentaireRequired = ecartExceedsThreshold;

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">Commentaires</h3>
      
      <div className="space-y-2">
        <label htmlFor="commentaire" className="block text-sm font-medium">
          Commentaire
          {commentaireRequired && <span className="text-red-600 ml-1">*</span>}
        </label>
        <textarea
          id="commentaire"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          className={cn(
            "w-full min-h-[100px] px-3 py-2 border rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            commentaireRequired && !commentaire && "border-red-500"
          )}
          placeholder={commentaireRequired ? "Commentaire obligatoire si écart dépasse le seuil" : "Commentaire optionnel"}
          required={commentaireRequired}
        />
        {commentaireRequired && !commentaire && (
          <p className="text-sm text-red-600">
            Un commentaire est requis car l'écart ({montantEcart.toFixed(2)}) dépasse le seuil ({seuilAlerte.toFixed(2)})
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="commentaireDevise" className="block text-sm font-medium">
          Commentaire devise
          <span className="text-gray-500 ml-1 text-xs">(optionnel)</span>
        </label>
        <textarea
          id="commentaireDevise"
          value={commentaireDevise}
          onChange={(e) => setCommentaireDevise(e.target.value)}
          className={cn(
            "w-full min-h-[100px] px-3 py-2 border rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
          placeholder="Commentaire spécifique à la devise (optionnel)"
        />
      </div>
    </div>
  );
};