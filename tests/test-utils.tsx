import { type RenderOptions, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

export function renderWithUser(ui: ReactElement, options?: RenderOptions) {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  };
}

export * from '@testing-library/react';
export { userEvent };
