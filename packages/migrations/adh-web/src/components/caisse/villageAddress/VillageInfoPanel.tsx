import type { VillageAddressFormData } from '@/types/villageAddress';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface VillageInfoPanelProps {
  formData: VillageAddressFormData;
  validationErrors: Partial<Record<keyof VillageAddressFormData, string>>;
  onFieldChange: (field: keyof VillageAddressFormData, value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VillageInfoPanel = ({
  formData,
  validationErrors,
  onFieldChange,
  disabled = false,
  className,
}: VillageInfoPanelProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900">Informations Village</h3>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="clubCode" className="block text-sm font-medium text-gray-700 mb-1">
            Code Club <span className="text-red-500">*</span>
          </label>
          <Input
            id="clubCode"
            type="text"
            value={formData.clubCode}
            onChange={(e) => onFieldChange('clubCode', e.target.value)}
            disabled={disabled}
            className={cn(validationErrors.clubCode && 'border-red-500')}
            placeholder="CLUB001"
          />
          {validationErrors.clubCode && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.clubCode}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            disabled={disabled}
            className={cn(validationErrors.name && 'border-red-500')}
            placeholder="Village Principal"
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse 1 <span className="text-red-500">*</span>
          </label>
          <Input
            id="address1"
            type="text"
            value={formData.address1}
            onChange={(e) => onFieldChange('address1', e.target.value)}
            disabled={disabled}
            className={cn(validationErrors.address1 && 'border-red-500')}
            placeholder="123 Rue de la Paix"
          />
          {validationErrors.address1 && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.address1}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse 2
          </label>
          <Input
            id="address2"
            type="text"
            value={formData.address2}
            onChange={(e) => onFieldChange('address2', e.target.value)}
            disabled={disabled}
            placeholder="Bâtiment A, Suite 200"
          />
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            Code Postal <span className="text-red-500">*</span>
          </label>
          <Input
            id="zipCode"
            type="text"
            value={formData.zipCode}
            onChange={(e) => onFieldChange('zipCode', e.target.value)}
            disabled={disabled}
            className={cn(validationErrors.zipCode && 'border-red-500')}
            placeholder="75001"
          />
          {validationErrors.zipCode && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.zipCode}</p>
          )}
        </div>
      </div>
    </div>
  );
};