import SearchForm from '../../src/components/SearchForm';
import { renderWithUser, screen } from '../test-utils';

describe('SearchForm', () => {
  it('renders an accessible city input and submits a trimmed query with the button', async () => {
    const onSearch = vi.fn();
    const { user } = renderWithUser(<SearchForm onSearch={onSearch} />);

    const input = screen.getByLabelText('Cidade');
    await user.type(input, '  São Paulo  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('submits by pressing Enter in the field', async () => {
    const onSearch = vi.fn();
    const { user } = renderWithUser(<SearchForm onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), 'Lisboa{Enter}');

    expect(onSearch).toHaveBeenCalledWith('Lisboa');
  });

  it('shows guidance for empty or short terms and does not submit', async () => {
    const onSearch = vi.fn();
    const { user } = renderWithUser(<SearchForm onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), ' a ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    const message = screen.getByRole('alert');
    const input = screen.getByLabelText('Cidade');

    expect(message).toHaveTextContent('Informe pelo menos 2 caracteres para buscar uma cidade.');
    expect(input).toHaveAccessibleDescription(message.textContent ?? '');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('communicates loading and prevents concurrent submissions', async () => {
    const onSearch = vi.fn();
    const { user } = renderWithUser(<SearchForm isLoading={true} onSearch={onSearch} />);

    expect(screen.getByLabelText('Cidade')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscando...' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Buscando...' }));

    expect(onSearch).not.toHaveBeenCalled();
  });
});
