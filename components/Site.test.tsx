import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Site from './Site';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const profile = { login: 'u', name: 'Ana', avatar: 'https://x/y.png', url: 'https://github.com/u' };

describe('Site', () => {
  it('arranca en español y muestra el nombre del perfil', () => {
    render(<Site repos={[]} profile={profile} user="u" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Código bonito.');
    expect(screen.getByText('Ana')).toBeTruthy();
  });

  it('cambia de idioma, lo recuerda y actualiza <html lang>', async () => {
    const user = userEvent.setup();
    render(<Site repos={[]} profile={profile} user="u" />);
    await user.click(screen.getByRole('button', { name: 'Cambiar idioma' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Pretty code.');
    expect(localStorage.getItem('lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('sin perfil usa el usuario y un enlace a GitHub válido', () => {
    render(<Site repos={[]} profile={null} user="solo" />);
    expect(screen.getByText('solo')).toBeTruthy();
    const links = screen.getAllByRole('link', { name: /GitHub/ });
    expect(links[0].getAttribute('href')).toBe('https://github.com/solo');
  });

  it('el lente es decorativo y no entra al árbol de accesibilidad', () => {
    const { container } = render(<Site repos={[]} profile={profile} user="u" />);
    expect(container.querySelector('.lens')?.getAttribute('aria-hidden')).toBe('true');
  });
});
