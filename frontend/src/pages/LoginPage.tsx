import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography
} from '@mui/material';

import { useAuthContext } from '../contexts/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login, user, loading } = useAuthContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  const onSubmit = async (values: LoginForm) => {
    await login(values.email, values.password);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Rezerva Yönetim Paneli
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Lütfen hesabınıza giriş yapın.
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="E-posta"
              type="email"
              fullWidth
              margin="normal"
              {...register('email', { required: 'E-posta zorunludur' })}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <TextField
              label="Şifre"
              type="password"
              fullWidth
              margin="normal"
              {...register('password', { required: 'Şifre zorunludur' })}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : 'Giriş Yap'}
            </Button>
          </Box>
          {loading && !user && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Kullanıcı bilgileri yükleniyor...
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
