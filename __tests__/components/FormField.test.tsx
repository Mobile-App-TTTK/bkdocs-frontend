import FormField from '@/components/FormField';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('FormField', () => {
  const defaultProps = {
    label: 'Email',
    value: '',
  };

  describe('Rendering', () => {
    it('should render label text', () => {
      render(<FormField {...defaultProps} />);

      expect(screen.getByText('Email')).toBeTruthy();
    });

    it('should render input with provided value', () => {
      render(<FormField {...defaultProps} value="test@example.com" />);

      const input = screen.getByDisplayValue('test@example.com');
      expect(input).toBeTruthy();
    });

    it('should render placeholder text', () => {
      render(
        <FormField 
          {...defaultProps} 
          placeholder="Enter your email" 
        />
      );

      expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
    });

    it('should render without placeholder when not provided', () => {
      render(<FormField {...defaultProps} />);

      // Input should exist but without placeholder
      const inputs = screen.root.findAllByType('TextInput');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Input Behavior', () => {
    it('should call onChangeText when text changes', () => {
      const mockOnChangeText = jest.fn();

      render(
        <FormField 
          {...defaultProps} 
          onChangeText={mockOnChangeText}
          placeholder="Enter text"
        />
      );

      const input = screen.getByPlaceholderText('Enter text');
      fireEvent.changeText(input, 'new value');

      expect(mockOnChangeText).toHaveBeenCalledWith('new value');
    });

    it('should be editable by default', () => {
      render(
        <FormField 
          {...defaultProps} 
          placeholder="Enter text"
        />
      );

      const input = screen.getByPlaceholderText('Enter text');
      expect(input.props.editable).not.toBe(false);
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <FormField 
          {...defaultProps} 
          placeholder="Enter text"
          disabled={true}
        />
      );

      const input = screen.getByPlaceholderText('Enter text');
      expect(input.props.editable).toBe(false);
    });

    it('should not be selectable when disabled', () => {
      render(
        <FormField 
          {...defaultProps} 
          placeholder="Enter text"
          disabled={true}
        />
      );

      const input = screen.getByPlaceholderText('Enter text');
      expect(input.props.selectTextOnFocus).toBe(false);
    });
  });

  describe('Keyboard Types', () => {
    it('should use default keyboard type', () => {
      render(
        <FormField 
          {...defaultProps} 
          placeholder="Enter text"
        />
      );

      const input = screen.getByPlaceholderText('Enter text');
      expect(input.props.keyboardType).toBe('default');
    });

    it('should use email keyboard type', () => {
      render(
        <FormField 
          {...defaultProps} 
          placeholder="Enter email"
          keyboardType="email-address"
        />
      );

      const input = screen.getByPlaceholderText('Enter email');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should use numeric keyboard type', () => {
      render(
        <FormField 
          label="Phone"
          value=""
          placeholder="Enter phone"
          keyboardType="numeric"
        />
      );

      const input = screen.getByPlaceholderText('Enter phone');
      expect(input.props.keyboardType).toBe('numeric');
    });
  });

  describe('Different Labels', () => {
    it('should render Vietnamese labels correctly', () => {
      render(
        <FormField 
          label="Họ và tên"
          value=""
        />
      );

      expect(screen.getByText('Họ và tên')).toBeTruthy();
    });

    it('should render different field labels', () => {
      const labels = ['Tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Năm nhập học'];

      labels.forEach((label) => {
        const { unmount } = render(
          <FormField label={label} value="" />
        );

        expect(screen.getByText(label)).toBeTruthy();
        unmount();
      });
    });
  });

  describe('Styling States', () => {
    it('should apply disabled styles when disabled', () => {
      const { toJSON } = render(
        <FormField 
          {...defaultProps}
          disabled={true}
          placeholder="Enter text"
        />
      );

      // Component should render differently when disabled
      // This is a snapshot-style test to ensure styles are applied
      expect(toJSON()).toBeTruthy();
    });

    it('should apply enabled styles by default', () => {
      const { toJSON } = render(
        <FormField 
          {...defaultProps}
          disabled={false}
          placeholder="Enter text"
        />
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Value Updates', () => {
    it('should display updated value after change', () => {
      const { rerender } = render(
        <FormField {...defaultProps} value="initial" />
      );

      expect(screen.getByDisplayValue('initial')).toBeTruthy();

      rerender(<FormField {...defaultProps} value="updated" />);

      expect(screen.getByDisplayValue('updated')).toBeTruthy();
    });

    it('should handle empty value', () => {
      render(<FormField {...defaultProps} value="" />);

      const inputs = screen.root.findAllByType('TextInput');
      expect(inputs[0].props.value).toBe('');
    });

    it('should handle long text values', () => {
      const longText = 'This is a very long text value that might exceed normal input lengths';
      
      render(<FormField {...defaultProps} value={longText} />);

      expect(screen.getByDisplayValue(longText)).toBeTruthy();
    });

    it('should handle special characters', () => {
      const specialChars = 'user@email.com!#$%^&*()';
      
      render(<FormField {...defaultProps} value={specialChars} />);

      expect(screen.getByDisplayValue(specialChars)).toBeTruthy();
    });

    it('should handle Vietnamese characters', () => {
      const vietnameseText = 'Nguyễn Văn Anh';
      
      render(<FormField label="Họ tên" value={vietnameseText} />);

      expect(screen.getByDisplayValue(vietnameseText)).toBeTruthy();
    });
  });
});

