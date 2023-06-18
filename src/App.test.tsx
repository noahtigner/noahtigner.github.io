import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent  from '@testing-library/user-event';

import App from './App';

describe('Renders main page correctly', async () => {
    afterEach(() => {
        cleanup();
    });

    it('Should render the page correctly', async () => {
        render(<App />);
        const h1 = screen.queryByText('Vite + React');

        expect(h1).toBeInTheDocument();
    });

    it('Should show the button count set to 0', async () => {
        render(<App />);
        const button = screen.queryByText('count is 0');

        expect(button).toBeInTheDocument();
    });

    it('Should show the button count set to 3', async () => {
        const user = userEvent.setup();
        render(<App />);
        const button = await screen.queryByText('count is 0');
        
        expect(button).toBeInTheDocument();

        await user.click(button as HTMLElement);
        await user.click(button as HTMLElement);
        await user.click(button as HTMLElement);
        
        expect(button?.innerHTML).toBe('count is 3');
   
    });
});