import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { useVillageAddressStore } from '@/stores/villageAddressStore';
import { useAuthStore } from '@/stores';
import type { VillageAddressFormData } from '@/types/villageAddress';

export function VillageAddressPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const _villageAddress = useVillageAddressStore((s) => s.villageAddress);
  const isLoading = useVillageAddressStore((s) => s.isLoading);
  const error = useVillageAddressStore((s) => s.error);
  const setVillageAddress = useVillageAddressStore((s) => s.setVillageAddress);
  const loadVillageAddress = useVillageAddressStore((s) => s.loadVillageAddress);
  const clearError = useVillageAddressStore((s) => s.clearError);
  const reset = useVillageAddressStore((s) => s.reset);

  const [formData, setFormData] = useState<VillageAddressFormData>({
    clubCode: '',
    name: '',
    address1: '',
    address2: '',
    zipCode: '',
    phone: '',
    email: '',
    siret: '',
    vatNumber: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof VillageAddressFormData, string>>>({});

  useEffect(() => {
    const initData = async () => {
      const data = await loadVillageAddress();
      if (data) {
        setFormData({
          clubCode: data.clubCode,
          name: data.name,
          address1: data.address1,
          address2: data.address2 || '',
          zipCode: data.zipCode,
          phone: data.phone || '',
          email: data.email || '',
          siret: data.siret || '',
          vatNumber: data.vatNumber || '',
        });
      }
    };
    initData();
  }, [loadVillageAddress]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof VillageAddressFormData, string>> = {};

    if (!formData.clubCode.trim()) {
      errors.clubCode = 'Code club requis';
    }
    if (!formData.name.trim()) {
      errors.name = 'Nom requis';
    }
    if (!formData.address1.trim()) {
      errors.address1 = 'Adresse requise';
    }
    if (!formData.zipCode.trim()) {
      errors.zipCode = 'Code postal requis';
    } else if (!/^\d{5}$/.test(formData.zipCode.trim())) {
      errors.zipCode = 'Code postal invalide (5 chiffres)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Email invalide';
    }

    if (formData.siret && !/^\d{14}$/.test(formData.siret.trim())) {
      errors.siret = 'SIRET invalide (14 chiffres)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof VillageAddressFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    await setVillageAddress({
      clubCode: formData.clubCode.trim(),
      name: formData.name.trim(),
      address1: formData.address1.trim(),
      address2: formData.address2.trim() || null,
      zipCode: formData.zipCode.trim(),
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      siret: formData.siret.trim() || null,
      vatNumber: formData.vatNumber.trim() || null,
    });

    if (!error) {
      navigate('/caisse/menu');
    }
  }, [formData, validateForm, setVillageAddress, error, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/caisse/menu');
  }, [navigate]);

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Adresse du village</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Configuration des informations du village
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-on-surface-muted uppercase tracking-wide">
              Informations du village
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Code club"
                  value={formData.clubCode}
                  onChange={(e) => handleInputChange('clubCode', e.target.value)}
                  error={validationErrors.clubCode}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  label="Nom"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={validationErrors.name}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <Input
                label="Adresse ligne 1"
                value={formData.address1}
                onChange={(e) => handleInputChange('address1', e.target.value)}
                error={validationErrors.address1}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                label="Adresse ligne 2"
                value={formData.address2}
                onChange={(e) => handleInputChange('address2', e.target.value)}
                error={validationErrors.address2}
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                label="Code postal"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                error={validationErrors.zipCode}
                required
                disabled={isLoading}
                maxLength={5}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-on-surface-muted uppercase tracking-wide">
              Informations de contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={validationErrors.phone}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={validationErrors.email}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-on-surface-muted uppercase tracking-wide">
              Informations légales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="SIRET"
                  value={formData.siret}
                  onChange={(e) => handleInputChange('siret', e.target.value)}
                  error={validationErrors.siret}
                  disabled={isLoading}
                  maxLength={14}
                />
              </div>
              <div>
                <Input
                  label="Numéro de TVA"
                  value={formData.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                  error={validationErrors.vatNumber}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </ScreenLayout>
  );
}

export default VillageAddressPage;
