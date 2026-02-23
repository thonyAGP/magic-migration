import { useState, useEffect } from 'react';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface InformationsChequeFormData {
  numeroCheque: string;
  montant: string;
  dateEmission: string;
  banque: string;
  titulaire: string;
}

interface InformationsChequeFormErrors {
  numeroCheque?: string;
  montant?: string;
  dateEmission?: string;
}

interface InformationsChequeCallbacks {
  onFormDataChange: (data: InformationsChequeFormData) => void;
  onValidationChange: (isValid: boolean) => void;
}

interface InformationsChequePanelProps {
  formData: InformationsChequeFormData;
  className?: string;
  disabled?: boolean;
  callbacks?: InformationsChequeCallbacks;
}

export const InformationsChequePanel = ({
  formData,
  className,
  disabled = false,
  callbacks,
}: InformationsChequePanelProps) => {
  const [errors, setErrors] = useState<InformationsChequeFormErrors>({});
  const [estPostdate, setEstPostdate] = useState(false);

  const validateField = (name: keyof InformationsChequeFormData, value: string): string | undefined => {
    switch (name) {
      case 'numeroCheque': {
        if (!value.trim()) return 'Le numéro de chèque est obligatoire';
        if (!/^[0-9]+$/.test(value)) return 'Le numéro de chèque doit contenir uniquement des chiffres';
        return undefined;
      }
      case 'montant': {
        if (!value.trim()) return 'Le montant est obligatoire';
        const montantNum = parseFloat(value);
        if (isNaN(montantNum) || montantNum <= 0) return 'Le montant doit être supérieur à 0';
        return undefined;
      }
      case 'dateEmission': {
        if (!value.trim()) return 'La date d\'émission est obligatoire';
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const handleChange = (name: keyof InformationsChequeFormData, value: string) => {
    const newFormData = { ...formData, [name]: value };
    const error = validateField(name, value);
    const newErrors = { ...errors };
    
    if (error) {
      newErrors[name as keyof InformationsChequeFormErrors] = error;
    } else {
      delete newErrors[name as keyof InformationsChequeFormErrors];
    }
    
    setErrors(newErrors);
    callbacks?.onFormDataChange(newFormData);
    callbacks?.onValidationChange(Object.keys(newErrors).length === 0);
  };

  useEffect(() => {
    if (formData.dateEmission) {
      const dateEmission = new Date(formData.dateEmission);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setEstPostdate(dateEmission > today);
    } else {
      setEstPostdate(false);
    }
  }, [formData.dateEmission]);

  useEffect(() => {
    const newErrors: InformationsChequeFormErrors = {};
    
    const numeroChequeError = validateField('numeroCheque', formData.numeroCheque);
    if (numeroChequeError) newErrors.numeroCheque = numeroChequeError;
    
    const montantError = validateField('montant', formData.montant);
    if (montantError) newErrors.montant = montantError;
    
    const dateEmissionError = validateField('dateEmission', formData.dateEmission);
    if (dateEmissionError) newErrors.dateEmission = dateEmissionError;
    
    setErrors(newErrors);
    callbacks?.onValidationChange(Object.keys(newErrors).length === 0);
  }, []);

  return (
    <div className={cn('space-y-4 p-4 border rounded-lg bg-white', className)}>
      <h3 className="text-lg font-semibold mb-4">Informations du chèque</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="numeroCheque" className="text-sm font-medium">
            Numéro de chèque <span className="text-red-500">*</span>
          </label>
          <Input
            id="numeroCheque"
            type="text"
            value={formData.numeroCheque}
            onChange={(e) => handleChange('numeroCheque', e.target.value)}
            disabled={disabled}
            className={cn(errors.numeroCheque && 'border-red-500')}
            placeholder="Ex: 1234567"
          />
          {errors.numeroCheque && (
            <span className="text-xs text-red-500">{errors.numeroCheque}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="montant" className="text-sm font-medium">
            Montant <span className="text-red-500">*</span>
          </label>
          <Input
            id="montant"
            type="number"
            step="0.01"
            min="0"
            value={formData.montant}
            onChange={(e) => handleChange('montant', e.target.value)}
            disabled={disabled}
            className={cn(errors.montant && 'border-red-500')}
            placeholder="0.00"
          />
          {errors.montant && (
            <span className="text-xs text-red-500">{errors.montant}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateEmission" className="text-sm font-medium">
            Date d'émission <span className="text-red-500">*</span>
          </label>
          <Input
            id="dateEmission"
            type="date"
            value={formData.dateEmission}
            onChange={(e) => handleChange('dateEmission', e.target.value)}
            disabled={disabled}
            className={cn(errors.dateEmission && 'border-red-500')}
          />
          {errors.dateEmission && (
            <span className="text-xs text-red-500">{errors.dateEmission}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="banque" className="text-sm font-medium">
            Banque
          </label>
          <Input
            id="banque"
            type="text"
            value={formData.banque}
            onChange={(e) => handleChange('banque', e.target.value)}
            disabled={disabled}
            placeholder="Nom de la banque"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="titulaire" className="text-sm font-medium">
            Titulaire
          </label>
          <Input
            id="titulaire"
            type="text"
            value={formData.titulaire}
            onChange={(e) => handleChange('titulaire', e.target.value)}
            disabled={disabled}
            placeholder="Nom du titulaire"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Chèque postdaté</label>
          <div className={cn(
            'flex items-center h-10 px-3 rounded-md border bg-gray-50',
            estPostdate ? 'border-orange-500 text-orange-700' : 'border-gray-300 text-gray-600'
          )}>
            <span className="font-medium">
              {estPostdate ? 'Oui (date future)' : 'Non'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};