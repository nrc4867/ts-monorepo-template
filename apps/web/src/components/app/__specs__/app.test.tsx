// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import '../../../i18n.js';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../app.js';

describe('App', () => {
  it('renders the translated title', () => {
    render(<App />);

    expect(screen.getByText('ts-monorepo-template')).toBeInTheDocument();
  });
});
