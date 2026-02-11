// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

function renderSidebar(currentPath = '/caisse/menu') {
  return render(
    <MemoryRouter initialEntries={[currentPath]}>
      <Sidebar isOpen={true} />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  describe('sections', () => {
    it('should render all menu sections', () => {
      renderSidebar();
      expect(screen.getByText('CAISSE')).toBeInTheDocument();
      expect(screen.getByText('VENTE & OPERATIONS')).toBeInTheDocument();
      expect(screen.getByText('ADHERENT')).toBeInTheDocument();
      expect(screen.getByText('HISTORIQUE & ADMIN')).toBeInTheDocument();
    });
  });

  describe('menu items', () => {
    it('should render all key menu items', () => {
      renderSidebar();
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      expect(screen.getByText('Menu caisse')).toBeInTheDocument();
      expect(screen.getByText('Vente')).toBeInTheDocument();
      expect(screen.getByText('Extrait compte')).toBeInTheDocument();
      expect(screen.getByText('Change')).toBeInTheDocument();
      expect(screen.getByText('Garantie')).toBeInTheDocument();
      expect(screen.getByText('Factures')).toBeInTheDocument();
      expect(screen.getByText('Club Med Pass')).toBeInTheDocument();
      expect(screen.getByText('Data Catching')).toBeInTheDocument();
      expect(screen.getByText('Separation')).toBeInTheDocument();
      expect(screen.getByText('Fusion')).toBeInTheDocument();
      expect(screen.getByText('Historique')).toBeInTheDocument();
      expect(screen.getByText('Reimpression')).toBeInTheDocument();
      expect(screen.getByText('Parametres')).toBeInTheDocument();
    });
  });

  describe('Link components', () => {
    it('should use Link elements (not <a href>)', () => {
      renderSidebar();
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(19);
      // Verify they are react-router Links (they render as <a> but with no full page reload)
      links.forEach((link) => {
        expect(link.tagName).toBe('A');
        expect(link.getAttribute('href')).toMatch(/^\/caisse/);
      });
    });
  });

  describe('active route highlighting', () => {
    it('should highlight active route', () => {
      renderSidebar('/caisse/vente/GP');
      const venteLink = screen.getByText('Vente').closest('a');
      expect(venteLink?.className).toContain('bg-primary/10');
      expect(venteLink?.className).toContain('text-primary');
      expect(venteLink?.className).toContain('font-medium');
    });

    it('should not highlight inactive routes', () => {
      renderSidebar('/caisse/vente');
      const changeLink = screen.getByText('Change').closest('a');
      expect(changeLink?.className).not.toContain('bg-primary/10');
      expect(changeLink?.className).toContain('text-on-surface');
    });
  });

  describe('collapsed state', () => {
    it('should have w-0 when closed', () => {
      render(
        <MemoryRouter>
          <Sidebar isOpen={false} />
        </MemoryRouter>
      );
      const aside = document.querySelector('aside');
      expect(aside?.className).toContain('w-0');
    });

    it('should have w-56 when open', () => {
      renderSidebar();
      const aside = document.querySelector('aside');
      expect(aside?.className).toContain('w-56');
    });
  });
});
