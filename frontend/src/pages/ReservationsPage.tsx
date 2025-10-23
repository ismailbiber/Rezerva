import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  AlertIcon,
  AlertText,
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  HStack,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollView,
  Spinner,
  Text,
  VStack,
  Select,
  SelectBackdrop,
  Icon,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@gluestack-ui/themed';
import { ChevronDownIcon } from '@gluestack-ui/icons';
import dayjs from 'dayjs';

import { apiClient } from '../services/api';
import type { Reservation, ReservationStatus, Space } from '../types/api';

interface ReservationForm {
  space_id?: number;
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

const statusColors: Record<ReservationStatus, string> = {
  pending: '$amber500',
  confirmed: '$emerald500',
  cancelled: '$rose500',
  checked_in: '$blue500',
  completed: '$teal500',
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

  const { control, handleSubmit, reset } = useForm<ReservationForm>({
    defaultValues: {
      space_id: undefined,
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      notes: '',
      start_time: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
      end_time: dayjs().add(2, 'hour').format('YYYY-MM-DDTHH:mm'),
    },
  });

  const handleDialogClose = () => {
    setDialogOpen(false);
    reset({
      space_id: undefined,
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      notes: '',
      start_time: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
      end_time: dayjs().add(2, 'hour').format('YYYY-MM-DDTHH:mm'),
    });
  };

  const submitReservation = handleSubmit(async (values) => {
    await createReservation.mutateAsync({
      ...values,
      space_id: values.space_id !== undefined ? Number(values.space_id) : undefined,
      start_time: dayjs(values.start_time).toISOString(),
      end_time: dayjs(values.end_time).toISOString(),
    });
    reset({
      space_id: undefined,
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      notes: '',
      start_time: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
      end_time: dayjs().add(2, 'hour').format('YYYY-MM-DDTHH:mm'),
    });
  });

  return (
    <VStack space="lg">
      <HStack justifyContent="space-between" alignItems="center" flexWrap="wrap" space="md">
        <Heading size="lg">Rezervasyonlar</Heading>
        <Button action="primary" onPress={() => setDialogOpen(true)}>
          <ButtonText>Yeni Rezervasyon</ButtonText>
        </Button>
      </HStack>

      {isLoading ? (
        <HStack alignItems="center" space="sm">
          <Spinner />
          <Text color="$textLight700">Rezervasyonlar yükleniyor...</Text>
        </HStack>
      ) : isError ? (
        <Alert action="error" variant="solid" borderRadius="$md">
          <AlertIcon mr="$2" />
          <AlertText>Rezervasyonlar yüklenemedi.</AlertText>
        </Alert>
      ) : reservations && reservations.length > 0 ? (
        <VStack space="md">
          {reservations.map((reservation) => {
            const spaceName = spaces?.find((s) => s.id === reservation.space_id)?.name ?? 'Bilinmiyor';
            return (
              <Box
                key={reservation.id}
                bg="$backgroundLight0"
                borderRadius="$lg"
                borderWidth="$1"
                borderColor="$borderLight200"
                p="$5"
              >
                <HStack justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" space="md">
                  <VStack space="xs">
                    <Text fontWeight="$bold" color="$textLight900" fontSize="$lg">
                      {reservation.customer_name}
                    </Text>
                    <Text color="$textLight500">{reservation.customer_email}</Text>
                    {reservation.customer_phone && (
                      <Text color="$textLight500">{reservation.customer_phone}</Text>
                    )}
                  </VStack>
                  <Badge bg={statusColors[reservation.status]} borderRadius="$md" px="$3" py="$1">
                    <BadgeText color="$textLight0">{statusLabels[reservation.status]}</BadgeText>
                  </Badge>
                </HStack>
                <HStack mt="$4" space="lg" flexWrap="wrap">
                  <VStack space="xs">
                    <Text color="$textLight500" fontSize="$xs">
                      Alan
                    </Text>
                    <Text color="$textLight800">{spaceName}</Text>
                  </VStack>
                  <VStack space="xs">
                    <Text color="$textLight500" fontSize="$xs">
                      Başlangıç
                    </Text>
                    <Text color="$textLight800">{dayjs(reservation.start_time).format('DD MMM YYYY HH:mm')}</Text>
                  </VStack>
                  <VStack space="xs">
                    <Text color="$textLight500" fontSize="$xs">
                      Bitiş
                    </Text>
                    <Text color="$textLight800">{dayjs(reservation.end_time).format('DD MMM YYYY HH:mm')}</Text>
                  </VStack>
                </HStack>
                {reservation.notes && (
                  <Box mt="$3">
                    <Text color="$textLight500" fontSize="$xs">
                      Notlar
                    </Text>
                    <Text color="$textLight800">{reservation.notes}</Text>
                  </Box>
                )}
              </Box>
            );
          })}
        </VStack>
      ) : (
        <Alert action="muted" variant="accent" borderRadius="$md">
          <AlertIcon mr="$2" />
          <AlertText>Henüz rezervasyon bulunmuyor.</AlertText>
        </Alert>
      )}

      <Modal isOpen={dialogOpen} onClose={handleDialogClose} size="lg">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Yeni Rezervasyon Oluştur</Heading>
          </ModalHeader>
          <ModalBody>
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space="md" mt="$2">
                <Controller
                  name="space_id"
                  control={control}
                  rules={{
                    required: 'Alan seçilmelidir',
                    validate: (value) => (value ? true : 'Alan seçilmelidir'),
                  }}
                  render={({ field: { value, onChange }, fieldState }) => (
                    <FormControl isInvalid={Boolean(fieldState.error)}>
                      <FormControlLabel>
                        <FormControlLabelText>Alan</FormControlLabelText>
                      </FormControlLabel>
                      <Select
                        selectedValue={value !== undefined ? String(value) : undefined}
                        onValueChange={(selected) =>
                          onChange(selected ? Number(selected) : undefined)
                        }
                      >
                        <SelectTrigger>
                          <SelectInput
                            placeholder="Alan seçin"
                            value={value !== undefined ? spaces?.find((space) => space.id === value)?.name ?? '' : ''}
                          />
                          <SelectIcon mr="$2">
                            <Icon as={ChevronDownIcon} />
                          </SelectIcon>
                        </SelectTrigger>
                        <SelectPortal>
                          <SelectBackdrop />
                          <SelectContent>
                            <SelectDragIndicatorWrapper>
                              <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            {spaces?.map((space) => (
                              <SelectItem key={space.id} label={space.name} value={String(space.id)} />
                            ))}
                          </SelectContent>
                        </SelectPortal>
                      </Select>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText>{fieldState.error.message}</FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                <HStack space="md" flexWrap="wrap">
                  <Box flex={1} minWidth={200}>
                    <Controller
                      name="start_time"
                      control={control}
                      rules={{ required: 'Başlangıç zamanı zorunludur' }}
                      render={({ field: { value, onChange }, fieldState }) => (
                        <FormControl isInvalid={Boolean(fieldState.error)}>
                          <FormControlLabel>
                            <FormControlLabelText>Başlangıç</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              type="datetime-local"
                              value={value}
                              onChangeText={onChange}
                            />
                          </Input>
                          {fieldState.error && (
                            <FormControlError>
                              <FormControlErrorText>{fieldState.error.message}</FormControlErrorText>
                            </FormControlError>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box flex={1} minWidth={200}>
                    <Controller
                      name="end_time"
                      control={control}
                      rules={{ required: 'Bitiş zamanı zorunludur' }}
                      render={({ field: { value, onChange }, fieldState }) => (
                        <FormControl isInvalid={Boolean(fieldState.error)}>
                          <FormControlLabel>
                            <FormControlLabelText>Bitiş</FormControlLabelText>
                          </FormControlLabel>
                          <Input>
                            <InputField
                              type="datetime-local"
                              value={value}
                              onChangeText={onChange}
                            />
                          </Input>
                          {fieldState.error && (
                            <FormControlError>
                              <FormControlErrorText>{fieldState.error.message}</FormControlErrorText>
                            </FormControlError>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
                </HStack>

                <Controller
                  name="customer_name"
                  control={control}
                  rules={{ required: 'Müşteri adı zorunludur' }}
                  render={({ field: { value, onChange }, fieldState }) => (
                    <FormControl isInvalid={Boolean(fieldState.error)}>
                      <FormControlLabel>
                        <FormControlLabelText>Müşteri Adı</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField value={value} onChangeText={onChange} placeholder="Müşteri adı" />
                      </Input>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText>{fieldState.error.message}</FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="customer_email"
                  control={control}
                  rules={{ required: 'Müşteri e-posta adresi zorunludur' }}
                  render={({ field: { value, onChange }, fieldState }) => (
                    <FormControl isInvalid={Boolean(fieldState.error)}>
                      <FormControlLabel>
                        <FormControlLabelText>Müşteri E-posta</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          value={value}
                          onChangeText={onChange}
                          placeholder="ornek@rezerva.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </Input>
                      {fieldState.error && (
                        <FormControlError>
                          <FormControlErrorText>{fieldState.error.message}</FormControlErrorText>
                        </FormControlError>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="customer_phone"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText>Telefon</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField value={value ?? ''} onChangeText={onChange} placeholder="0 555 555 55 55" />
                      </Input>
                    </FormControl>
                  )}
                />

                <Controller
                  name="notes"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText>Notlar</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          value={value ?? ''}
                          onChangeText={onChange}
                          placeholder="Rezervasyona dair ek bilgiler"
                          multiline
                          numberOfLines={3}
                        />
                      </Input>
                    </FormControl>
                  )}
                />
              </VStack>
            </ScrollView>
            {createReservation.isError && (
              <Alert action="error" variant="solid" borderRadius="$md" mt="$4">
                <AlertIcon mr="$2" />
                <AlertText>Rezervasyon oluşturulamadı. Lütfen bilgileri kontrol edin.</AlertText>
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack space="md" justifyContent="flex-end" width="100%">
              <Button variant="outline" action="secondary" onPress={handleDialogClose}>
                <ButtonText>Vazgeç</ButtonText>
              </Button>
              <Button onPress={submitReservation} isDisabled={createReservation.isPending} action="primary">
                {createReservation.isPending ? (
                  <HStack alignItems="center" space="sm">
                    <Spinner color="$textLight0" />
                    <ButtonText>Kaydediliyor...</ButtonText>
                  </HStack>
                ) : (
                  <ButtonText>Kaydet</ButtonText>
                )}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
