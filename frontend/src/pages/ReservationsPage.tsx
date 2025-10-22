import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';

import { apiClient } from '../services/api';
import type { Reservation, ReservationStatus, Space } from '../types/api';

interface ReservationForm {
  space_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Beklemede',
  confirmed: 'Onaylandı',
  cancelled: 'İptal',
  checked_in: 'Giriş Yapıldı',
  completed: 'Tamamlandı'
};

export const ReservationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: reservations, isLoading, isError } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Reservation[] }>('/reservations', {
        params: { limit: 200 }
      });
      return response.data.items;
    }
  });
  const { data: spaces } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const response = await apiClient.get<Space[]>('/venues/spaces');
      return response.data;
    }
  });

  const createReservation = useMutation({
    mutationFn: async (payload: ReservationForm) => {
      await apiClient.post('/reservations', payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setDialogOpen(false);
    }
  });

  const { register, handleSubmit, reset } = useForm<ReservationForm>({
    defaultValues: {
      start_time: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
      end_time: dayjs().add(2, 'hour').format('YYYY-MM-DDTHH:mm')
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    await createReservation.mutateAsync({
      ...values,
      space_id: Number(values.space_id),
      start_time: dayjs(values.start_time).toISOString(),
      end_time: dayjs(values.end_time).toISOString()
    });
    reset();
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Rezervasyonlar</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Yeni Rezervasyon
        </Button>
      </Box>
      {isLoading ? (
        <Typography>Rezervasyonlar yükleniyor...</Typography>
      ) : isError ? (
        <Alert severity="error">Rezervasyonlar yüklenemedi.</Alert>
      ) : reservations && reservations.length > 0 ? (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Müşteri</TableCell>
                <TableCell>Alan</TableCell>
                <TableCell>Başlangıç</TableCell>
                <TableCell>Bitiş</TableCell>
                <TableCell>Durum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((reservation) => {
                const spaceName = spaces?.find((s) => s.id === reservation.space_id)?.name ?? 'Bilinmiyor';
                return (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{reservation.customer_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reservation.customer_email}
                      </Typography>
                    </TableCell>
                    <TableCell>{spaceName}</TableCell>
                    <TableCell>{dayjs(reservation.start_time).format('DD MMM YYYY HH:mm')}</TableCell>
                    <TableCell>{dayjs(reservation.end_time).format('DD MMM YYYY HH:mm')}</TableCell>
                    <TableCell>{statusLabels[reservation.status]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Alert severity="info">Henüz rezervasyon bulunmuyor.</Alert>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Rezervasyon Oluştur</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }} onSubmit={onSubmit} id="reservation-form">
            <TextField
              select
              label="Alan"
              fullWidth
              margin="normal"
              defaultValue=""
              {...register('space_id', { required: true })}
            >
              {spaces?.map((space) => (
                <MenuItem key={space.id} value={space.id}>
                  {space.name}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Başlangıç"
                  type="datetime-local"
                  fullWidth
                  margin="normal"
                  {...register('start_time', { required: true })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Bitiş"
                  type="datetime-local"
                  fullWidth
                  margin="normal"
                  {...register('end_time', { required: true })}
                />
              </Grid>
            </Grid>
            <TextField label="Müşteri Adı" fullWidth margin="normal" {...register('customer_name', { required: true })} />
            <TextField label="Müşteri E-posta" type="email" fullWidth margin="normal" {...register('customer_email', { required: true })} />
            <TextField label="Telefon" fullWidth margin="normal" {...register('customer_phone')} />
            <TextField label="Notlar" fullWidth multiline minRows={2} margin="normal" {...register('notes')} />
          </Box>
          {createReservation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Rezervasyon oluşturulamadı. Lütfen bilgileri kontrol edin.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Vazgeç</Button>
          <Button type="submit" form="reservation-form" variant="contained" disabled={createReservation.isPending}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
