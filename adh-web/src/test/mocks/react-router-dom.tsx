import React from 'react';
import { vi } from 'vitest';

export const mockNavigate = vi.fn();
export const mockSearchParams = new URLSearchParams();
export const mockSetSearchParams = vi.fn();

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const MemoryRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = ({ element }: { element: React.ReactNode }) => <>{element}</>;
export const Link = ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
  <a href={to} {...props}>{children}</a>
);
export const NavLink = Link;
export const Navigate = ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />;
export const Outlet = () => <div data-testid="outlet" />;

export const useNavigate = () => mockNavigate;
export const useParams = () => ({});
export const useSearchParams = () => [mockSearchParams, mockSetSearchParams] as const;
export const useLocation = () => ({ pathname: '/', search: '', hash: '', state: null, key: 'default' });
