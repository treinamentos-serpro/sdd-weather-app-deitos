import LocationResults from '../../src/components/LocationResults';
import { lisbonLocation, saoPauloLocation } from '../fixtures/weather';
import { renderWithUser, screen, within } from '../test-utils';

describe('LocationResults', () => {
  it('renders nothing when there are no locations', () => {
    const { container } = renderWithUser(<LocationResults locations={[]} onSelect={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('preserves result order and displays regional context when present', () => {
    renderWithUser(
      <LocationResults locations={[saoPauloLocation, lisbonLocation]} onSelect={vi.fn()} />,
    );

    const options = screen.getAllByRole('button');

    expect(options).toHaveLength(2);
    expect(within(options[0]).getByText('São Paulo')).toBeInTheDocument();
    expect(within(options[0]).getByText('São Paulo, Brasil')).toBeInTheDocument();
    expect(within(options[1]).getByText('Lisboa')).toBeInTheDocument();
    expect(within(options[1]).getByText('Lisboa, Portugal')).toBeInTheDocument();
  });

  it('omits only missing context parts without hiding the city name', () => {
    renderWithUser(
      <LocationResults
        locations={[{ ...saoPauloLocation, admin1: null, country: null }]}
        onSelect={vi.fn()}
      />,
    );

    const option = screen.getByRole('button', { name: 'São Paulo' });

    expect(option).toBeInTheDocument();
    expect(screen.queryByText('Brasil')).not.toBeInTheDocument();
  });

  it('emits the complete selected location once by click or keyboard activation', async () => {
    const onSelect = vi.fn();
    const { user } = renderWithUser(
      <LocationResults locations={[saoPauloLocation, lisbonLocation]} onSelect={onSelect} />,
    );

    await user.click(screen.getByRole('button', { name: /São Paulo/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(saoPauloLocation);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith(lisbonLocation);
  });
});
