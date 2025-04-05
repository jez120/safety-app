import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; // To wrap components using Link
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext'; // We need to mock this

// Mock the useAuth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});


describe('Navbar Component', () => {
  it('renders Login button when user is not logged in', () => {
    // Arrange: Set mock return value for useAuth when logged out
    (useAuth as vi.Mock).mockReturnValue({ user: null, logout: vi.fn() });

    // Act: Render the Navbar inside a MemoryRouter because it uses <Link>
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Assert: Check if the Login button is present
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    // Assert: Check that Logout button is NOT present
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    // Assert: Check that Admin Dashboard link is NOT present
    expect(screen.queryByRole('link', { name: /admin dashboard/i })).not.toBeInTheDocument();
  });

  it('renders user info and Logout button when user is logged in (employee)', () => {
    // Arrange: Set mock return value for useAuth when logged in as employee
    const mockUser = { userId: 1, username: 'testuser', email: 'test@test.com', role: 'employee' };
    (useAuth as vi.Mock).mockReturnValue({ user: mockUser, logout: vi.fn() });

    // Act
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Assert: Check for welcome message and logout button
    expect(screen.getByText(/welcome, testuser! \(employee\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    // Assert: Check that Login button is NOT present
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
    // Assert: Check that Admin Dashboard link is NOT present for employee
    expect(screen.queryByRole('link', { name: /admin dashboard/i })).not.toBeInTheDocument();
  });

  it('renders Admin Dashboard link when user is logged in as admin', () => {
    // Arrange: Set mock return value for useAuth when logged in as admin
    const mockUser = { userId: 2, username: 'adminuser', email: 'admin@test.com', role: 'admin' };
    (useAuth as vi.Mock).mockReturnValue({ user: mockUser, logout: vi.fn() });

    // Act
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Assert: Check that Admin Dashboard link IS present for admin
    expect(screen.getByRole('link', { name: /admin dashboard/i })).toBeInTheDocument();
  });

  // TODO: Add test for logout button click
});
