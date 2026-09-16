import CurrentWeather from '../../src/components/CurrentWeather';
import DailyForecast from '../../src/components/DailyForecast';
import { incompleteWeatherData, completeWeatherData } from '../fixtures/weather';
import { renderWithUser, screen, within } from '../test-utils';

describe('weather display components', () => {
  it('renders current weather metrics with condition label and alt text', () => {
    renderWithUser(<CurrentWeather current={completeWeatherData.current} unit="celsius" />);

    expect(screen.getByRole('heading', { name: 'Clima atual' })).toBeInTheDocument();
    expect(screen.getByText('24°C')).toBeInTheDocument();
    expect(screen.getByText('Sensação 26°C')).toBeInTheDocument();
    expect(screen.getByLabelText('Céu parcialmente nublado')).toHaveTextContent(
      'Parcialmente nublado',
    );
    expect(screen.getByText('Umidade').nextElementSibling).toHaveTextContent('68%');
    expect(screen.getByText('Vento').nextElementSibling).toHaveTextContent('13 km/h');
    expect(screen.getByText('Precipitação').nextElementSibling).toHaveTextContent('0 mm');
  });

  it('renders neutral fallback for missing current weather fields', () => {
    renderWithUser(<CurrentWeather current={incompleteWeatherData.current} unit="fahrenheit" />);

    expect(screen.getAllByText('—')).toHaveLength(4);
    expect(screen.getByText('Sensação —')).toBeInTheDocument();
    expect(screen.getByLabelText('Condição climática indisponível')).toHaveTextContent(
      'Condição indisponível',
    );
  });

  it('renders exactly five daily forecast cards with expected labels', () => {
    renderWithUser(<DailyForecast days={completeWeatherData.daily} unit="celsius" />);

    const forecast = screen.getByRole('heading', { name: 'Próximos 5 dias' }).closest('section');
    const cards = within(forecast!).getAllByRole('article');

    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Máxima')).toBeInTheDocument();
    expect(within(cards[0]).getByText('28°C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Mínima')).toBeInTheDocument();
    expect(within(cards[0]).getByText('18°C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Precipitação')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Vento')).toBeInTheDocument();
  });

  it('limits daily forecast rendering to five cards', () => {
    renderWithUser(
      <DailyForecast
        days={[
          ...completeWeatherData.daily,
          { ...completeWeatherData.daily[0], date: '2026-09-21' },
        ]}
        unit="celsius"
      />,
    );

    expect(screen.getAllByRole('article')).toHaveLength(5);
  });
});