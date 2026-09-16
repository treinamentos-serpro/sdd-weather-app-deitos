import FeedbackState from '../../src/components/FeedbackState';
import { renderWithUser, screen } from '../test-utils';

describe('FeedbackState', () => {
  it('renders initial guidance without weather data from another location', () => {
    renderWithUser(<FeedbackState error={null} status="idle" />);

    expect(screen.getByRole('status')).toHaveTextContent('Busque uma cidade');
    expect(screen.getByRole('status')).not.toHaveTextContent('São Paulo');
  });

  it('announces loading states politely', () => {
    renderWithUser(<FeedbackState error={null} status="loadingForecast" />);

    const feedback = screen.getByRole('status');

    expect(feedback).toHaveAttribute('aria-live', 'polite');
    expect(feedback).toHaveTextContent('Carregando previsão');
  });

  it('renders empty state copy without stale location data', () => {
    renderWithUser(<FeedbackState error={null} status="empty" />);

    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma localidade encontrada');
    expect(screen.getByRole('status')).not.toHaveTextContent('Lisboa');
  });

  it('renders an accessible retry action on error and keeps focus on the button', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithUser(
      <FeedbackState
        error={{ code: 'network', message: 'Não foi possível conectar ao serviço meteorológico.' }}
        onRetry={onRetry}
        status="error"
      />,
    );

    const retryButton = screen.getByRole('button', { name: 'Tentar novamente' });

    retryButton.focus();
    await user.click(retryButton);

    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao serviço meteorológico.',
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(retryButton).toHaveFocus();
  });

  it('does not render feedback for selection or success states', () => {
    const { container, rerender } = renderWithUser(<FeedbackState error={null} status="success" />);

    expect(container).toBeEmptyDOMElement();

    rerender(<FeedbackState error={null} status="selectingLocation" />);

    expect(container).toBeEmptyDOMElement();
  });
});
