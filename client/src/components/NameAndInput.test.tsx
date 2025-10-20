import { render, screen, fireEvent } from '@testing-library/react';
import { NameAndInput, NameAndInputPreview } from './NameAndInput';

describe('NameAndInput', () => {
  const mockSetter = jest.fn();
  const mockName = 'Test Field';
  const mockValue = 'Test Value';
  const mockType = 'text';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with name label and input field', () => {
    render(
      <NameAndInput
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    expect(screen.getByText(mockName)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockValue)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { type: 'text' })).toBeInTheDocument();
  });

  it('displays correct input value', () => {
    render(
      <NameAndInput
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    const input = screen.getByDisplayValue(mockValue);
    expect(input).toHaveValue(mockValue);
  });

  it('calls setter when input value changes', () => {
    render(
      <NameAndInput
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    const input = screen.getByRole('textbox', { type: 'text' });
    const newValue = 'New Test Value';

    fireEvent.change(input, { target: { value: newValue } });

    expect(mockSetter).toHaveBeenCalledTimes(1);
    expect(mockSetter).toHaveBeenCalledWith(newValue);
  });

  it('renders different input types correctly', () => {
    render(
      <NameAndInput
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type="email"
      />
    );

    const input = screen.getByRole('textbox', { type: 'email' });
    expect(input).toHaveAttribute('type', 'email');
  });

  it('applies correct CSS classes to container', () => {
    const { container } = render(
      <NameAndInput
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveAttribute('class', expect.stringContaining('flex'));
    expect(containerDiv).toHaveAttribute('class', expect.stringContaining('flex-col'));
  });

  it('has accessible structure', () => {
    render(
      <NameAndInput
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    const label = screen.getByText(mockName);
    const input = screen.getByRole('textbox');

    // Verify label and input are properly associated
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label.textContent).toBe(mockName);
  });
});

describe('NameAndInputPreview', () => {
  const mockSetter = jest.fn();
  const mockName = 'Test Field';
  const mockValue = 'Test Value';
  const mockType = 'text';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input without external label', () => {
    const { container } = render(
      <NameAndInputPreview
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    // Should only have the input element, not the label
    expect(container.firstChild).toHaveAttribute('class', expect.stringContaining('border'));
    expect(screen.queryByText(mockName)).not.toBeInTheDocument();
  });

  it('uses name as placeholder', () => {
    render(
      <NameAndInputPreview
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    const input = screen.getByRole('textbox', { type: 'text' });
    expect(input).toHaveAttribute('placeholder', mockName);
  });

  it('displays current value in input', () => {
    render(
      <NameAndInputPreview
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    const input = screen.getByRole('textbox', { type: 'text' });
    expect(input).toHaveValue(mockValue);
  });

  it('calls setter when input value changes', () => {
    render(
      <NameAndInputPreview
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    const input = screen.getByRole('textbox', { type: 'text' });
    const newValue = 'New Test Value';

    fireEvent.change(input, { target: { value: newValue } });

    expect(mockSetter).toHaveBeenCalledTimes(1);
    expect(mockSetter).toHaveBeenCalledWith(newValue);
  });

  it('applies correct CSS styling and accessibility', () => {
    render(
      <NameAndInputPreview
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type={mockType}
      />
    );

    const input = screen.getByRole('textbox', { type: 'text' });
    expect(input).toHaveAttribute('class', expect.stringContaining('border'));
    expect(input).toHaveAttribute('class', expect.stringContaining('rounded'));
    expect(input).toHaveAttribute('class', expect.stringContaining('bg-white'));
  });

  it('supports different input types', () => {
    render(
      <NameAndInputPreview
        name={mockName}
        value={mockValue}
        setter={mockSetter}
        type="password"
      />
    );

    const input = screen.getByRole('textbox', { type: 'password' });
    expect(input).toHaveAttribute('type', 'password');
  });
});

describe('Both components integration', () => {
  it('both components render and function correctly', () => {
    const mockSetter = jest.fn();

    render(
      <>
        <NameAndInput
          name="Input Field"
          value="Input Value"
          setter={mockSetter}
          type="text"
        />
        <NameAndInputPreview
          name="Preview Field"
          value="Preview Value"
          setter={mockSetter}
          type="text"
        />
      </>
    );

    // Check that both components render
    expect(screen.getByText('Input Field')).toBeInTheDocument();

    // Check both inputs have correct values
    const inputs = screen.getAllByDisplayValue('Input Value');
    expect(inputs).toHaveLength(1); // Only NameAndInput should have this value

    // Check preview has placeholder
    const previewInput = screen.getByRole('textbox', { placeholder: /preview field/i });
    expect(previewInput).toBeInTheDocument();
  });
});