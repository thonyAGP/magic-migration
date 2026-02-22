import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

const MAX_COMMENTAIRE_LENGTH = 100;

interface CommentaireSectionPanelProps {
  commentaire: string;
  onCommentaireChange: (value: string) => void;
  className?: string;
}

export const CommentaireSectionPanel = ({
  commentaire,
  onCommentaireChange,
  className,
}: CommentaireSectionPanelProps) => {
  const remainingChars = MAX_COMMENTAIRE_LENGTH - commentaire.length;
  const isNearLimit = remainingChars <= 20;
  const isAtLimit = remainingChars === 0;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMMENTAIRE_LENGTH) {
      onCommentaireChange(value);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor="commentaire" className="text-sm font-medium text-gray-700">
        Commentaire (optionnel)
      </label>
      <Input
        id="commentaire"
        type="text"
        value={commentaire}
        onChange={handleChange}
        placeholder="Saisir un commentaire..."
        maxLength={MAX_COMMENTAIRE_LENGTH}
        className="w-full"
      />
      <div
        className={cn(
          'text-xs text-right transition-colors',
          isAtLimit && 'text-red-600 font-semibold',
          isNearLimit && !isAtLimit && 'text-orange-500',
          !isNearLimit && 'text-gray-500'
        )}
      >
        {remainingChars} / {MAX_COMMENTAIRE_LENGTH} caractères restants
      </div>
    </div>
  );
};