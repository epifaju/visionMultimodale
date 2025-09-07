import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OcrProcessor } from '../OcrProcessor';
import { documentApi } from '../../../services/api';

// Mock the API
vi.mock('../../../services/api', () => ({
  documentApi: {
    extractOcr: vi.fn(),
  },
}));

// Mock the UI components
vi.mock('../../ui/Button', () => ({
  Button: ({ children, onClick, disabled, loading, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || loading} {...props}>
      {loading ? 'Traitement...' : children}
    </button>
  ),
}));

vi.mock('../../ui/Card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: any) => (
    <div data-testid="loading-spinner" data-size={size}>
      Loading...
    </div>
  ),
}));

describe('OcrProcessor', () => {
  const mockFile = new File(['test image content'], 'test.jpg', { type: 'image/jpeg' });
  const mockOnResult = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with file', () => {
    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Extraction OCR')).toBeInTheDocument();
    expect(screen.getByText('Extraire le texte')).toBeInTheDocument();
    expect(screen.getByText('Extraction de texte depuis l\'image avec Tesseract')).toBeInTheDocument();
  });

  it('calls API when process button is clicked', async () => {
    const mockOcrResult = {
      success: true,
      text: 'Extracted text',
      confidence: 0.95,
      language: 'fra',
      textLength: 14,
      processingTime: 1000,
    };

    (documentApi.extractOcr as any).mockResolvedValue({
      success: true,
      data: mockOcrResult,
    });

    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const processButton = screen.getByText('Extraire le texte');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(documentApi.extractOcr).toHaveBeenCalledWith(mockFile);
    });

    await waitFor(() => {
      expect(mockOnResult).toHaveBeenCalledWith(mockOcrResult);
    });
  });

  it('shows loading state during processing', async () => {
    (documentApi.extractOcr as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const processButton = screen.getByText('Extraire le texte');
    fireEvent.click(processButton);

    expect(screen.getByText('Traitement...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays results after successful processing', async () => {
    const mockOcrResult = {
      success: true,
      text: 'Extracted text from image',
      confidence: 0.95,
      language: 'fra',
      textLength: 25,
      processingTime: 1500,
    };

    (documentApi.extractOcr as any).mockResolvedValue({
      success: true,
      data: mockOcrResult,
    });

    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const processButton = screen.getByText('Extraire le texte');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // textLength
      expect(screen.getByText('95%')).toBeInTheDocument(); // confidence
      expect(screen.getByText('fra')).toBeInTheDocument(); // language
      expect(screen.getByText('Extracted text from image')).toBeInTheDocument(); // text
    });
  });

  it('handles API errors correctly', async () => {
    const mockError = new Error('OCR processing failed');
    (documentApi.extractOcr as any).mockRejectedValue(mockError);

    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const processButton = screen.getByText('Extraire le texte');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('OCR processing failed');
    });
  });

  it('handles API response with error', async () => {
    (documentApi.extractOcr as any).mockResolvedValue({
      success: false,
      error: 'Invalid image format',
    });

    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const processButton = screen.getByText('Extraire le texte');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Invalid image format');
    });
  });

  it('displays error message when OCR result has error', async () => {
    const mockOcrResult = {
      success: false,
      text: '',
      confidence: 0,
      language: 'fra',
      textLength: 0,
      processingTime: 1000,
      errorMessage: 'No text detected in image',
    };

    (documentApi.extractOcr as any).mockResolvedValue({
      success: true,
      data: mockOcrResult,
    });

    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const processButton = screen.getByText('Extraire le texte');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('No text detected in image')).toBeInTheDocument();
    });
  });

  it('disables button during processing', async () => {
    (documentApi.extractOcr as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const processButton = screen.getByText('Extraire le texte');
    fireEvent.click(processButton);

    expect(processButton).toBeDisabled();
  });

  it('shows correct statistics after processing', async () => {
    const mockOcrResult = {
      success: true,
      text: 'Hello World',
      confidence: 0.87,
      language: 'eng',
      textLength: 11,
      processingTime: 2000,
    };

    (documentApi.extractOcr as any).mockResolvedValue({
      success: true,
      data: mockOcrResult,
    });

    render(
      <OcrProcessor
        file={mockFile}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const processButton = screen.getByText('Extraire le texte');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('11')).toBeInTheDocument(); // Characters
      expect(screen.getByText('87%')).toBeInTheDocument(); // Confidence
      expect(screen.getByText('eng')).toBeInTheDocument(); // Language
    });
  });
});
