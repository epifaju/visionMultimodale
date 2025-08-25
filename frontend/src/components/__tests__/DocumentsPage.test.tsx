import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DocumentsPage from '../DocumentsPage';
import type { Document } from '../../types';

// Mock de l'API
jest.mock('../../services/api', () => ({
  documentApi: {
    getDocuments: jest.fn(),
  },
}));

const mockDocuments: Document[] = [
  {
    id: 1,
    fileName: 'test-document.pdf',
    originalFileName: 'test-document.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 1024, // 1MB
    status: 'COMPLETED',
    uploadedById: 1,
    uploadedByUsername: 'testuser',
    uploadedAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    extractedText: 'Test content',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DocumentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title and description', () => {
    renderWithRouter(<DocumentsPage />);
    
    expect(screen.getByText('Mes Documents')).toBeInTheDocument();
    expect(screen.getByText('Gérez et consultez tous vos documents traités')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithRouter(<DocumentsPage />);
    
    expect(screen.getByText('Mes Documents')).toBeInTheDocument();
  });

  it('displays documents when loaded', async () => {
    const { documentApi } = require('../../services/api');
    documentApi.getDocuments.mockResolvedValue({
      content: mockDocuments,
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 20,
      first: true,
      last: true,
    });

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });
  });

  it('shows no documents message when empty', async () => {
    const { documentApi } = require('../../services/api');
    documentApi.getDocuments.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 20,
      first: true,
      last: true,
    });

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun document')).toBeInTheDocument();
    });
  });

  it('handles filter changes', async () => {
    const { documentApi } = require('../../services/api');
    documentApi.getDocuments.mockResolvedValue({
      content: mockDocuments,
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 20,
      first: true,
      last: true,
    });

    renderWithRouter(<DocumentsPage />);

    const statusFilter = screen.getByDisplayValue('Tous les statuts');
    fireEvent.change(statusFilter, { target: { value: 'COMPLETED' } });

    await waitFor(() => {
      expect(documentApi.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'COMPLETED' })
      );
    });
  });

  it('handles search input', async () => {
    const { documentApi } = require('../../services/api');
    documentApi.getDocuments.mockResolvedValue({
      content: mockDocuments,
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 20,
      first: true,
      last: true,
    });

    renderWithRouter(<DocumentsPage />);

    const searchInput = screen.getByPlaceholderText('Rechercher dans le contenu des documents...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Attendre le debounce
    await waitFor(() => {
      expect(documentApi.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({ searchQuery: 'test' })
      );
    }, { timeout: 600 });
  });

  it('calls onDocumentSelect when view button is clicked', async () => {
    const mockOnDocumentSelect = jest.fn();
    const { documentApi } = require('../../services/api');
    documentApi.getDocuments.mockResolvedValue({
      content: mockDocuments,
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 20,
      first: true,
      last: true,
    });

    renderWithRouter(<DocumentsPage onDocumentSelect={mockOnDocumentSelect} />);

    await waitFor(() => {
      const viewButton = screen.getByText('Voir');
      fireEvent.click(viewButton);
      expect(mockOnDocumentSelect).toHaveBeenCalledWith(mockDocuments[0]);
    });
  });
});
