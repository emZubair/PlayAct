import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText('PlayAct - Material UI Testing Demo')).toBeInTheDocument();
  });

  it('renders all three component sections', () => {
    render(<App />);
    expect(screen.getByText('Checkbox Component')).toBeInTheDocument();
    expect(screen.getByText('TextField Component')).toBeInTheDocument();
    expect(screen.getByText('Autocomplete Component')).toBeInTheDocument();
  });
});

describe('Checkbox Component', () => {
  it('renders checkbox with correct label', () => {
    render(<App />);
    expect(screen.getByText('I accept the terms and conditions')).toBeInTheDocument();
  });

  it('checkbox is initially unchecked', () => {
    render(<App />);
    const checkbox = screen.getByTestId('accept-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('displays "Not Accepted" status when unchecked', () => {
    render(<App />);
    expect(screen.getByTestId('checkbox-status')).toHaveTextContent('Status: Not Accepted');
  });

  it('can be checked by clicking', () => {
    render(<App />);
    const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('displays "Accepted" status when checked', () => {
    render(<App />);
    const checkbox = screen.getByTestId('accept-checkbox');

    fireEvent.click(checkbox);

    expect(screen.getByTestId('checkbox-status')).toHaveTextContent('Status: Accepted');
  });

  it('can be toggled multiple times', () => {
    render(<App />);
    const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });

    // Check
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Uncheck
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Check again
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('has correct aria-label for accessibility', () => {
    render(<App />);
    const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });
    expect(checkbox).toHaveAttribute('aria-label', 'Accept terms');
  });
});

describe('TextField Component', () => {
  it('renders with correct label', () => {
    render(<App />);
    expect(screen.getAllByText('Enter your name')[0]).toBeInTheDocument();
  });

  it('is initially empty', () => {
    render(<App />);
    const input = screen.getByTestId('name-input');
    expect(input).toHaveValue('');
  });

  it('displays character count of 0 initially', () => {
    render(<App />);
    expect(screen.getByText('Character count: 0')).toBeInTheDocument();
  });

  it('does not show greeting when empty', () => {
    render(<App />);
    expect(screen.queryByTestId('textfield-output')).not.toBeInTheDocument();
  });

  it('updates value when typing', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('name-input');

    await user.type(input, 'John');

    expect(input).toHaveValue('John');
  });

  it('displays correct character count when typing', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('name-input');

    await user.type(input, 'Alice');

    expect(screen.getByText('Character count: 5')).toBeInTheDocument();
  });

  it('shows greeting message with entered name', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('name-input');

    await user.type(input, 'Bob');
    expect(screen.getByTestId('textfield-output')).toHaveTextContent('Hello, Bob!');
  });

  it('updates character count dynamically', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('name-input');

    await user.type(input, 'Test');
    expect(screen.getByText('Character count: 4')).toBeInTheDocument();

    await user.type(input, 'ing');
    expect(screen.getByText('Character count: 7')).toBeInTheDocument();
  });

  it('handles clearing input', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('name-input');

    await user.type(input, 'Test');
    expect(input).toHaveValue('Test');

    await user.clear(input);
    expect(input).toHaveValue('');
    expect(screen.queryByTestId('textfield-output')).not.toBeInTheDocument();
  });

  it('handles special characters', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('name-input');

    await user.type(input, 'Test@123!');

    expect(input).toHaveValue('Test@123!');
    expect(screen.getByTestId('textfield-output')).toHaveTextContent('Hello, Test@123!!');
  });
});

describe('Autocomplete Component', () => {
  it('renders with correct label', () => {
    render(<App />);
    expect(screen.getAllByText('Select a fruit')[0]).toBeInTheDocument();
  });

  it('is initially empty', () => {
    render(<App />);
    const input = screen.getByTestId('fruit-autocomplete-input');
    expect(input).toHaveValue('');
  });

  it('does not show selection message initially', () => {
    render(<App />);
    expect(screen.queryByTestId('autocomplete-output')).not.toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('fruit-autocomplete-input');

    await user.click(input);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  it('displays all fruit options when opened', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('fruit-autocomplete-input');

    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Cherry')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Elderberry')).toBeInTheDocument();
      expect(screen.getByText('Fig')).toBeInTheDocument();
      expect(screen.getByText('Grape')).toBeInTheDocument();
      expect(screen.getByText('Honeydew')).toBeInTheDocument();
    });
  });

  it('filters options when typing', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('fruit-autocomplete-input');

    await user.type(input, 'App');

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
  });

  it('selects an option when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('fruit-autocomplete-input');

    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Banana'));

    await waitFor(() => {
      expect(screen.getByTestId('autocomplete-output')).toHaveTextContent('You selected: Banana');
    });
  });

  it('displays selected value in input', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('fruit-autocomplete-input');

    await user.click(input);
    await waitFor(() => expect(screen.getByText('Cherry')).toBeInTheDocument());
    await user.click(screen.getByText('Cherry'));

    await waitFor(() => {
      expect(input).toHaveValue('Cherry');
    });
  });

  it('can change selection', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('fruit-autocomplete-input');

    // Select first fruit
    await user.click(input);
    await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());
    await user.click(screen.getByText('Apple'));

    await waitFor(() => {
      expect(screen.getByTestId('autocomplete-output')).toHaveTextContent('You selected: Apple');
    });

    // Change to another fruit
    await user.clear(input);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('Grape')).toBeInTheDocument());
    await user.click(screen.getByText('Grape'));

    await waitFor(() => {
      expect(screen.getByTestId('autocomplete-output')).toHaveTextContent('You selected: Grape');
    });
  });

  it('handles case-insensitive filtering', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByTestId('fruit-autocomplete-input');

    await user.type(input, 'banana');

    await waitFor(() => {
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
  });
});

describe('Integration Tests', () => {
  it('all components work independently', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Use checkbox
    const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    // Use textfield
    const textInput = screen.getByTestId('name-input');
    await user.type(textInput, 'Integration Test');
    expect(textInput).toHaveValue('Integration Test');

    // Use autocomplete
    const autocompleteInput = screen.getByTestId('fruit-autocomplete-input');
    await user.click(autocompleteInput);
    await waitFor(() => expect(screen.getByText('Fig')).toBeInTheDocument());
    await user.click(screen.getByText('Fig'));

    // Verify all states maintained
    expect(checkbox).toBeChecked();
    expect(textInput).toHaveValue('Integration Test');
    await waitFor(() => {
      expect(screen.getByTestId('autocomplete-output')).toHaveTextContent('You selected: Fig');
    });
  });
});
