import UnitToggle from '../../src/components/UnitToggle';
import { renderWithUser, screen } from '../test-utils';

describe('UnitToggle', () => {
  it('marks Celsius as selected by default when the parent passes Celsius', () => {
    renderWithUser(<UnitToggle onChange={vi.fn()} unit="celsius" />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('emits the selected unit without changing data itself', async () => {
    const onChange = vi.fn();
    const { user } = renderWithUser(<UnitToggle onChange={onChange} unit="celsius" />);

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });
});