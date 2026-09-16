import { formatIsoDatePtBr } from '../../src/utils/date';

describe('date utils', () => {
  it('formats valid ISO dates in pt-BR without shifting the day', () => {
    const formattedDate = formatIsoDatePtBr('2026-09-16');

    expect(formattedDate).toContain('16');
    expect(formattedDate.toLocaleLowerCase('pt-BR')).toContain('set');
  });

  it('returns fallback for null or invalid dates', () => {
    expect(formatIsoDatePtBr(null)).toBe('—');
    expect(formatIsoDatePtBr('data-invalida')).toBe('—');
  });
});
