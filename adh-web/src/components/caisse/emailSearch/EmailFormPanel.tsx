import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { CreateEmailDto, UpdateEmailDto, EmailAddress } from '@/types/emailSearch';

interface EmailFormPanelProps {
  isEditMode: boolean;
  selectedEmail: EmailAddress | null;
  onSave: (data: CreateEmailDto | UpdateEmailDto) => Promise<void>;
  onCancel: () => void;
}

export const EmailFormPanel = ({
  isEditMode,
  selectedEmail,
  onSave,
  onCancel,
}: EmailFormPanelProps) => {
  const [formData, setFormData] = useState<CreateEmailDto>({
    societe: '',
    compte: '',
    filiation: 0,
    email: '',
    isPrincipal: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && selectedEmail) {
      setFormData({
        societe: selectedEmail.societe,
        compte: selectedEmail.compte,
        filiation: selectedEmail.filiation,
        email: selectedEmail.email,
        isPrincipal: selectedEmail.isPrincipal,
      });
    } else {
      setFormData({
        societe: '',
        compte: '',
        filiation: 0,
        email: '',
        isPrincipal: false,
      });
    }
    setValidationError(null);
  }, [isEditMode, selectedEmail]);

  const validateForm = (): boolean => {
    if (!isEditMode) {
      if (!formData.societe.trim()) {
        setValidationError('Société est requis');
        return false;
      }
      if (!formData.compte.trim()) {
        setValidationError('Compte est requis');
        return false;
      }
      if (formData.filiation < 0) {
        setValidationError('Filiation doit être >= 0');
        return false;
      }
    }

    if (!formData.email.trim()) {
      setValidationError('Email est requis');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError('Format email invalide');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const updateDto: UpdateEmailDto = {
          email: formData.email,
          isPrincipal: formData.isPrincipal,
        };
        await onSave(updateDto);
      } else {
        await onSave(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateEmailDto, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  return (
    <div className="space-y-4 p-4 bg-white border border-gray-300 rounded">
      <div className="space-y-3">
        <div>
          <label htmlFor="societe" className="block text-sm font-medium text-gray-700 mb-1">
            Société
          </label>
          <Input
            id="societe"
            value={formData.societe}
            onChange={(e) => handleInputChange('societe', e.target.value)}
            disabled={isEditMode}
            className={cn(isEditMode && 'bg-gray-100 cursor-not-allowed')}
          />
        </div>

        <div>
          <label htmlFor="compte" className="block text-sm font-medium text-gray-700 mb-1">
            Compte
          </label>
          <Input
            id="compte"
            value={formData.compte}
            onChange={(e) => handleInputChange('compte', e.target.value)}
            disabled={isEditMode}
            className={cn(isEditMode && 'bg-gray-100 cursor-not-allowed')}
          />
        </div>

        <div>
          <label htmlFor="filiation" className="block text-sm font-medium text-gray-700 mb-1">
            Filiation
          </label>
          <Input
            id="filiation"
            type="number"
            min={0}
            value={formData.filiation}
            onChange={(e) => handleInputChange('filiation', parseInt(e.target.value, 10) || 0)}
            disabled={isEditMode}
            className={cn(isEditMode && 'bg-gray-100 cursor-not-allowed')}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isPrincipal"
            type="checkbox"
            checked={formData.isPrincipal}
            onChange={(e) => handleInputChange('isPrincipal', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPrincipal" className="text-sm font-medium text-gray-700">
            Email principal
          </label>
        </div>
      </div>

      {validationError && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {validationError}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={isSubmitting}
          className="flex-1"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};