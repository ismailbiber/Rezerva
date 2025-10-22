import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const navItems = [
  { label: 'Gösterge Paneli', path: '/dashboard' },
  { label: 'Rezervasyonlar', path: '/reservations' },
  { label: 'Lokasyonlar', path: '/venues' }
];

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthContext();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Rezerva
          </Typography>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color={location.pathname === item.path ? 'secondary' : 'inherit'}
              component={RouterLink}
              to={item.path}
              sx={{ textTransform: 'none', mr: 1 }}
            >
              {item.label}
            </Button>
          ))}
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.full_name ?? user?.email}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Çıkış Yap
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ flexGrow: 1, py: 4 }} maxWidth="lg">
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 3, textAlign: 'center', fontSize: '0.875rem' }}>
        © {new Date().getFullYear()} Rezerva. Tüm hakları saklıdır.
      </Box>
    </Box>
  );
};
