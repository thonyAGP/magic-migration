/**
 * Target directory scaffolding for the migration pipeline.
 * Creates minimal infrastructure files needed for TSC verification
 * when the target directory doesn't already have them (e.g. fresh dir).
 */
import fs from 'node:fs';
import path from 'node:path';
const TSCONFIG_APP = {
    compilerOptions: {
        tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
        target: 'ES2022',
        useDefineForClassFields: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        verbatimModuleSyntax: true,
        moduleDetection: 'force',
        noEmit: true,
        jsx: 'react-jsx',
        baseUrl: '.',
        paths: { '@/*': ['./src/*'] },
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        erasableSyntaxOnly: true,
    },
    include: ['src'],
};
const TSCONFIG_ROOT = {
    files: [],
    references: [{ path: './tsconfig.app.json' }],
    compilerOptions: {
        baseUrl: '.',
        paths: { '@/*': ['./src/*'] },
    },
};
const PACKAGE_JSON = {
    name: 'migration-output',
    private: true,
    type: 'module',
    dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        zustand: '^5.0.0',
        axios: '^1.7.0',
        'react-router-dom': '^7.0.0',
        'lucide-react': '^0.400.0',
    },
    devDependencies: {
        typescript: '^5.9.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
        vitest: '^3.0.0',
        '@testing-library/react': '^16.0.0',
        '@testing-library/jest-dom': '^6.5.0',
        jsdom: '^25.0.0',
    },
};
const STUBS = {
    'src/stores/dataSourceStore.ts': `import { create } from 'zustand';

interface DataSourceState {
  isRealApi: boolean;
  toggle: () => void;
  setRealApi: (value: boolean) => void;
}

export const useDataSourceStore = create<DataSourceState>()(
  (set) => ({
    isRealApi: false,
    toggle: () => set((state) => ({ isRealApi: !state.isRealApi })),
    setRealApi: (value: boolean) => set({ isRealApi: value }),
  })
);
`,
    'src/stores/uiStore.ts': `import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  (set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  })
);
`,
    'src/stores/authStore.ts': `import { create } from 'zustand';

interface AuthState {
  user: { id: number; name: string } | null;
  login: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    login: (name: string) => set({ user: { id: 1, name } }),
    logout: () => set({ user: null }),
  })
);
`,
    'src/stores/index.ts': `export { useDataSourceStore } from './dataSourceStore';
export { useUiStore } from './uiStore';
export { useAuthStore } from './authStore';
`,
    'src/services/api/apiClient.ts': `import axios, { type AxiosInstance } from 'axios';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
`,
    'src/services/api/index.ts': `export { apiClient } from './apiClient';
export type { ApiResponse, ApiError } from './apiClient';
`,
    'src/components/layout/ScreenLayout.tsx': `import { type ReactNode } from 'react';

interface ScreenLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export const ScreenLayout = ({ children, className }: ScreenLayoutProps) => (
  <div className={className}>{children}</div>
);
`,
    'src/components/layout/index.ts': `export { ScreenLayout } from './ScreenLayout';
`,
    'src/components/ui/Button.tsx': `import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ children, className, ...props }: ButtonProps) => (
  <button className={className} {...props}>{children}</button>
);
`,
    'src/components/ui/Dialog.tsx': `import { type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Dialog = ({ open, onClose, title, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div role="dialog">
      {title && <h2>{title}</h2>}
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
};
`,
    'src/components/ui/Input.tsx': `import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className, ...props }: InputProps) => (
  <div>
    {label && <label>{label}</label>}
    <input className={className} {...props} />
  </div>
);
`,
    'src/components/ui/index.ts': `export { Button } from './Button';
export { Dialog } from './Dialog';
export { Input } from './Input';
`,
    'src/lib/utils.ts': `export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');
`,
};
const VITEST_CONFIG = `import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
    },
  },
});
`;
export const scaffoldTargetDir = (config) => {
    const { targetDir } = config;
    let created = 0;
    let skipped = 0;
    // Create target dir if it doesn't exist
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    // tsconfig.json
    const tsconfigPath = path.join(targetDir, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
        fs.writeFileSync(tsconfigPath, JSON.stringify(TSCONFIG_ROOT, null, 2), 'utf8');
        created++;
    }
    else
        skipped++;
    // tsconfig.app.json
    const tsconfigAppPath = path.join(targetDir, 'tsconfig.app.json');
    if (!fs.existsSync(tsconfigAppPath)) {
        fs.writeFileSync(tsconfigAppPath, JSON.stringify(TSCONFIG_APP, null, 2), 'utf8');
        created++;
    }
    else
        skipped++;
    // package.json
    const packagePath = path.join(targetDir, 'package.json');
    if (!fs.existsSync(packagePath)) {
        fs.writeFileSync(packagePath, JSON.stringify(PACKAGE_JSON, null, 2), 'utf8');
        created++;
    }
    else
        skipped++;
    // vitest.config.ts
    const vitestPath = path.join(targetDir, 'vitest.config.ts');
    if (!fs.existsSync(vitestPath)) {
        fs.writeFileSync(vitestPath, VITEST_CONFIG, 'utf8');
        created++;
    }
    else
        skipped++;
    // Stub files
    for (const [relPath, content] of Object.entries(STUBS)) {
        const fullPath = path.join(targetDir, relPath);
        if (!fs.existsSync(fullPath)) {
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir))
                fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(fullPath, content, 'utf8');
            created++;
        }
        else
            skipped++;
    }
    return { created, skipped };
};
//# sourceMappingURL=migrate-scaffold.js.map