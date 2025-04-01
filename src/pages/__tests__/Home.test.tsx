import { screen } from '@testing-library/react';
import Home from '../Home';
import { renderWithProviders } from '../../test-utils';
import { runTestSuite, expectSafe } from '../../test-runner';
import { vi } from 'vitest';
import { qrService } from '../../services/qrService';
import { waitFor } from '@testing-library/react';

// Mock the qrService
vi.mock('../../services/qrService', () => ({
  qrService: {
    getAllQRCodes: vi.fn()
  }
}));

runTestSuite('Home Component', () => {
  const mockQRCodes = [
    {
      id: '1',
      name: 'Test Item 1',
      quantity: 5,
      price: 10.99,
      createdAt: new Date('2024-03-20'),
      qrCode: JSON.stringify({ name: 'Test Item 1', quantity: 5, price: 10.99 })
    },
    {
      id: '2',
      name: 'Test Item 2',
      quantity: 3,
      price: 15.50,
      createdAt: new Date('2024-03-19'),
      qrCode: JSON.stringify({ name: 'Test Item 2', quantity: 3, price: 15.50 })
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state while fetching QR codes', () => {
    vi.mocked(qrService.getAllQRCodes).mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<Home />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when fetching QR codes fails', async () => {
    vi.mocked(qrService.getAllQRCodes).mockRejectedValueOnce(new Error('Fetch failed'));
    
    renderWithProviders(<Home />);
    
    await waitFor(() => {
      expectSafe(screen.getByText(/failed to load qr codes/i)).toBeInTheDocument();
    });
  });

  it('displays empty state message when no QR codes exist', async () => {
    vi.mocked(qrService.getAllQRCodes).mockResolvedValueOnce([]);
    
    renderWithProviders(<Home />);
    
    await waitFor(() => {
      expectSafe(screen.getByText(/no qr codes generated yet/i)).toBeInTheDocument();
    });
  });

  it('displays list of QR codes when data is fetched successfully', async () => {
    vi.mocked(qrService.getAllQRCodes).mockResolvedValueOnce(mockQRCodes);
    
    renderWithProviders(<Home />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expectSafe(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Verify QR codes are displayed
    mockQRCodes.forEach(qrCode => {
      expectSafe(screen.getByText(qrCode.name)).toBeInTheDocument();
      expectSafe(screen.getByText(`Quantity: ${qrCode.quantity}`)).toBeInTheDocument();
      expectSafe(screen.getByText(`Price: $${qrCode.price.toFixed(2)}`)).toBeInTheDocument();
      expectSafe(screen.getByText(new Date(qrCode.createdAt).toLocaleDateString())).toBeInTheDocument();
    });
  });

  it('displays QR codes in correct order (newest first)', async () => {
    vi.mocked(qrService.getAllQRCodes).mockResolvedValueOnce(mockQRCodes);
    
    renderWithProviders(<Home />);
    
    await waitFor(() => {
      expectSafe(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Get all QR code cards
    const qrCodeCards = screen.getAllByRole('article');
    
    // Verify order (newest first)
    expect(qrCodeCards[0]).toHaveTextContent(mockQRCodes[0].name); // March 20
    expect(qrCodeCards[1]).toHaveTextContent(mockQRCodes[1].name); // March 19
  });

  it('displays hero section with correct content', () => {
    renderWithProviders(<Home />);
    
    expectSafe(screen.getByText(/welcome to qr inventory system/i)).toBeInTheDocument();
    expectSafe(screen.getByText(/streamline your inventory management with qr codes/i)).toBeInTheDocument();
  });

  it('displays features section with all features', () => {
    renderWithProviders(<Home />);
    
    expectSafe(screen.getByText(/generate qr codes/i)).toBeInTheDocument();
    expectSafe(screen.getByText(/manage cart/i)).toBeInTheDocument();
    expectSafe(screen.getByText(/track inventory/i)).toBeInTheDocument();
  });

  const renderHome = () => {
    renderWithProviders(<Home />);
  };

  describe('Hero Section', () => {
    test('renders hero section with correct title and subtitle', () => {
      renderHome();
      expectSafe(screen.getByText('Welcome to QR Inventory System')).toBeInTheDocument();
      expectSafe(screen.getByText('Streamline your inventory management with QR codes')).toBeInTheDocument();
    });

    test('hero section has correct styling', () => {
      renderHome();
      const heroSection = screen.getByTestId('hero-section');
      expectSafe(heroSection).toHaveStyle({
        color: 'rgb(255, 255, 255)',
        background: expect.stringContaining('linear-gradient')
      });
    });
  });

  describe('Feature Cards', () => {
    test('renders all feature cards', () => {
      renderHome();
      expectSafe(screen.getByText('Easy QR Code Generation')).toBeInTheDocument();
      expectSafe(screen.getByText('Quick Scanning')).toBeInTheDocument();
      expectSafe(screen.getByText('Real-time Updates')).toBeInTheDocument();
    });

    test('feature cards have correct descriptions', () => {
      renderHome();
      expectSafe(screen.getByText('Generate QR codes for your inventory items with just a few clicks')).toBeInTheDocument();
      expectSafe(screen.getByText('Scan QR codes instantly to access item details and update information')).toBeInTheDocument();
      expectSafe(screen.getByText('Keep your inventory data up-to-date with real-time synchronization')).toBeInTheDocument();
    });
  });

  describe('Call to Action', () => {
    test('renders call to action section with correct content', () => {
      renderHome();
      expectSafe(screen.getByText('Ready to get started?')).toBeInTheDocument();
      expectSafe(screen.getByText('Generate your first QR code now')).toBeInTheDocument();
    });

    test('call to action section has correct styling', () => {
      renderHome();
      const ctaSection = screen.getByText('Ready to get started?').closest('section');
      expectSafe(ctaSection).toHaveStyle({
        background: expect.stringContaining('linear-gradient'),
        padding: expect.stringContaining('px'),
        textAlign: 'center'
      });
    });
  });

  describe('Layout', () => {
    test('main container has correct styling', () => {
      renderHome();
      const container = screen.getByRole('main');
      expectSafe(container).toHaveStyle({
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      });
    });
  });
}); 