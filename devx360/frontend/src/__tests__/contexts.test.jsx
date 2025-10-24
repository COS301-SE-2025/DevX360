import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>theme:{theme}</button>
  );
}

describe('ThemeContext', () => {
  test('provides default theme and toggles', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    const btn = screen.getByRole('button');
    expect(btn.textContent).toMatch(/theme:/);
    const current = btn.textContent;
    act(() => {
      btn.click();
    });
    expect(btn.textContent).not.toBe(current);
  });
});


