import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography
} from '@mui/material';

import { apiClient } from '../services/api';
import type { Venue } from '../types/api';

interface VenueForm {
  name: string;
  slug: string;
  timezone: string;
  description?: string;
  address?: string;
}

export const VenuesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Venue[] }>('/venues', { params: { limit: 100 } });
      return response.data.items;
    }
  });

  const createVenue = useMutation({
    mutationFn: async (payload: VenueForm) => {
      await apiClient.post('/venues', payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['venues'] });
      setOpen(false);
    }
  });

  const { register, handleSubmit, reset } = useForm<VenueForm>({
    defaultValues: {
      timezone: 'Europe/Istanbul'
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    await createVenue.mutateAsync(values);
    reset();
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Lokasyonlar</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Yeni Lokasyon
        </Button>
      </Box>
      {isLoading ? (
        <Typography>Lokasyonlar yükleniyor...</Typography>
      ) : isError ? (
        <Alert severity="error">Lokasyonlar yüklenemedi.</Alert>
      ) : data && data.length > 0 ? (
        <Grid container spacing={3}>
          {data.map((venue) => (
            <Grid item xs={12} md={6} key={venue.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{venue.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {venue.address || 'Adres bilgisi girilmemiş'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Zaman Dilimi: {venue.timezone}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Alan Sayısı: {venue.spaces.length}
                  </Typography>
                  {venue.spaces.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Alanlar</Typography>
                      <ul>
                        {venue.spaces.map((space) => (
                          <li key={space.id}>
                            {space.name} – Kapasite: {space.capacity}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">Henüz lokasyon tanımlanmamış.</Alert>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Lokasyon Ekle</DialogTitle>
        <DialogContent>
          <Box component="form" id="venue-form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            <TextField label="İsim" fullWidth margin="normal" {...register('name', { required: true })} />
            <TextField label="Slug" fullWidth margin="normal" {...register('slug', { required: true })} />
            <TextField label="Adres" fullWidth margin="normal" {...register('address')} />
            <TextField label="Zaman Dilimi" fullWidth margin="normal" {...register('timezone', { required: true })} />
            <TextField label="Açıklama" fullWidth margin="normal" multiline minRows={2} {...register('description')} />
          </Box>
          {createVenue.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Lokasyon oluşturulamadı. Bilgileri kontrol edin.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Vazgeç</Button>
          <Button type="submit" form="venue-form" variant="contained" disabled={createVenue.isPending}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
