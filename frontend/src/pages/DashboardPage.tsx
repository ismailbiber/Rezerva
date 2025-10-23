import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  AlertIcon,
  AlertText,
  Box,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
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
    return (
      <HStack alignItems="center" space="sm">
        <Spinner />
        <Text color="$textLight700">Özet yükleniyor...</Text>
      </HStack>
    );
  }

  if (isError || !data) {
    return (
      <Alert action="error" variant="solid" borderRadius="$md">
        <AlertIcon mr="$2" />
        <AlertText>Özet bilgileri yüklenemedi.</AlertText>
      </Alert>
    );
  }

  const summaryCards = [
    { label: 'Toplam Lokasyon', value: data.totals.venues },
    { label: 'Toplam Alan', value: data.totals.spaces },
    { label: 'Toplam Rezervasyon', value: data.totals.reservations },
  ];

  return (
    <VStack space="xl">
      <HStack flexWrap="wrap" space="md">
        {summaryCards.map((card) => (
          <Box
            key={card.label}
            flexGrow={1}
            minWidth={240}
            bg="$backgroundLight0"
            borderRadius="$lg"
            p="$5"
            borderWidth="$1"
            borderColor="$borderLight200"
          >
            <Text color="$textLight500" fontSize="$sm" mb="$2">
              {card.label}
            </Text>
            <Heading size="2xl">{card.value}</Heading>
          </Box>
        ))}
      </HStack>

      <Box bg="$backgroundLight0" borderRadius="$lg" borderWidth="$1" borderColor="$borderLight200" p="$5">
        <HStack justifyContent="space-between" alignItems="center" mb="$4">
          <Heading size="md">Yaklaşan Rezervasyonlar</Heading>
          <Text color="$textLight500">Son 5 kayıt</Text>
        </HStack>
        {data.upcoming.length === 0 ? (
          <Text color="$textLight500">Kayıtlı yaklaşan rezervasyon yok.</Text>
        ) : (
          <VStack space="md">
            {data.upcoming.map((reservation, index) => (
              <Box
                key={reservation.id}
                borderBottomWidth={index === data.upcoming.length - 1 ? '$0' : '$1'}
                borderColor="$borderLight200"
                pb="$3"
              >
                <Text fontWeight="$bold" color="$textLight900">
                  {reservation.customer_name}
                </Text>
                <Text color="$textLight500" fontSize="$sm">
                  {`${dayjs(reservation.start_time).format('DD MMM YYYY HH:mm')} — ${dayjs(reservation.end_time).format('DD MMM YYYY HH:mm')}`}
                </Text>
                <Text color="$textLight400" fontSize="$xs" mt="$1">
                  Durum: {reservation.status}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};
