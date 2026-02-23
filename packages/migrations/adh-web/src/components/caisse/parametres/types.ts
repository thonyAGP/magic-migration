export interface SettingsSection {
  id: string;
  label: string;
  icon: string;
}

export interface UserSettingsProps {
  className?: string;
}

export interface CaisseSettingsProps {
  className?: string;
}

export interface PrinterSettingsProps {
  className?: string;
}

export interface AuditLogProps {
  className?: string;
}

export interface NetworkSettingsProps {
  className?: string;
}

export interface SettingsNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}
