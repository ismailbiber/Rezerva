import { useQuery } from '@tanstack/react-query';
import { Alert, Card, CardContent, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import dayjs from 'dayjs';

import { apiClient } from '../services/api';
import type { Reservation } from '../types/api';

interface DashboardSummary {
  totals: {
    venues: number;
    spaces: number;
    reservations: number;
  };
  upcoming: Reservation[];
}

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
      return response.data;
    }
  });

  if (isLoading) {
    return <Typography>Özet yükleniyor...</Typography>;
  }

  if (isError || !data) {
    return <Alert severity="error">Özet bilgileri yüklenemedi.</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Toplam Lokasyon</Typography>
            <Typography variant="h3">{data.totals.venues}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Toplam Alan</Typography>
            <Typography variant="h3">{data.totals.spaces}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Toplam Rezervasyon</Typography>
            <Typography variant="h3">{data.totals.reservations}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Yaklaşan Rezervasyonlar
            </Typography>
            {data.upcoming.length === 0 ? (
              <Typography>Kayıtlı yaklaşan rezervasyon yok.</Typography>
            ) : (
              <List>
                {data.upcoming.map((reservation) => (
                  <ListItem key={reservation.id} divider>
                    <ListItemText
                      primary={`${reservation.customer_name} - ${dayjs(reservation.start_time).format('DD MMM YYYY HH:mm')}`}
                      secondary={`Durum: ${reservation.status} • Bitiş: ${dayjs(reservation.end_time).format('DD MMM YYYY HH:mm')}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
