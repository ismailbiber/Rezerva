import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  AlertIcon,
  AlertText,
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
} from '@gluestack-ui/themed';

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
    },
  });

  const createVenue = useMutation({
    mutationFn: async (payload: VenueForm) => {
      await apiClient.post('/venues', payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['venues'] });
      setOpen(false);
    },
  });

  const { control, handleSubmit, reset } = useForm<VenueForm>({
    defaultValues: {
      name: '',
      slug: '',
      timezone: 'Europe/Istanbul',
      address: '',
      description: '',
    },
  });

  const handleClose = () => {
    setOpen(false);
    reset({ name: '', slug: '', timezone: 'Europe/Istanbul', address: '', description: '' });
  };

  const submitVenue = handleSubmit(async (values) => {
    await createVenue.mutateAsync(values);
    reset({ name: '', slug: '', timezone: 'Europe/Istanbul', address: '', description: '' });
  });

  return (
    <VStack space="lg">
      <HStack justifyContent="space-between" alignItems="center" flexWrap="wrap" space="md">
        <Heading size="lg">Lokasyonlar</Heading>
        <Button action="primary" onPress={() => setOpen(true)}>
          <ButtonText>Yeni Lokasyon</ButtonText>
        </Button>
      </HStack>

      {isLoading ? (
        <HStack alignItems="center" space="sm">
          <Spinner />
          <Text color="$textLight700">Lokasyonlar yükleniyor...</Text>
        </HStack>
      ) : isError ? (
        <Alert action="error" variant="solid" borderRadius="$md">
          <AlertIcon mr="$2" />
          <AlertText>Lokasyonlar yüklenemedi.</AlertText>
        </Alert>
      ) : data && data.length > 0 ? (
        <VStack space="md">
          {data.map((venue) => (
            <Box
              key={venue.id}
              bg="$backgroundLight0"
              borderRadius="$lg"
              borderWidth="$1"
              borderColor="$borderLight200"
              p="$5"
            >
              <VStack space="sm">
                <Heading size="md">{venue.name}</Heading>
                <Text color="$textLight500">{venue.address || 'Adres bilgisi girilmemiş'}</Text>
                <Text color="$textLight600">Zaman Dilimi: {venue.timezone}</Text>
                <Text color="$textLight600">Alan Sayısı: {venue.spaces.length}</Text>
                {venue.spaces.length > 0 && (
                  <Box borderWidth="$1" borderColor="$borderLight200" borderRadius="$md" p="$3" bg="$backgroundLight50">
                    <Text fontWeight="$semibold" mb="$2">
                      Alanlar
                    </Text>
                    <VStack space="xs">
                      {venue.spaces.map((space) => (
                        <Text key={space.id} color="$textLight700">
                          {space.name} • Kapasite: {space.capacity}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      ) : (
        <Alert action="muted" variant="accent" borderRadius="$md">
          <AlertIcon mr="$2" />
          <AlertText>Henüz lokasyon tanımlanmamış.</AlertText>
        </Alert>
      )}

      <Modal isOpen={open} onClose={handleClose} size="lg">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Yeni Lokasyon Ekle</Heading>
          </ModalHeader>
          <ModalBody>
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space="md" mt="$2">
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Lokasyon adı zorunludur' }}
                  render={({ field: { value, onChange }, fieldState }) => (
                    <FormControl isInvalid={Boolean(fieldState.error)}>
                      <FormControlLabel>
                        <FormControlLabelText>İsim</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField value={value} onChangeText={onChange} placeholder="Lokasyon adı" />
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
                  name="slug"
                  control={control}
                  rules={{ required: 'Slug zorunludur' }}
                  render={({ field: { value, onChange }, fieldState }) => (
                    <FormControl isInvalid={Boolean(fieldState.error)}>
                      <FormControlLabel>
                        <FormControlLabelText>Slug</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField value={value} onChangeText={onChange} placeholder="ornek-lokasyon" />
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
                  name="address"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText>Adres</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField value={value ?? ''} onChangeText={onChange} placeholder="Adres bilgisi" />
                      </Input>
                    </FormControl>
                  )}
                />

                <Controller
                  name="timezone"
                  control={control}
                  rules={{ required: 'Zaman dilimi zorunludur' }}
                  render={({ field: { value, onChange }, fieldState }) => (
                    <FormControl isInvalid={Boolean(fieldState.error)}>
                      <FormControlLabel>
                        <FormControlLabelText>Zaman Dilimi</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField value={value} onChangeText={onChange} placeholder="Europe/Istanbul" />
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
                  name="description"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControl>
                      <FormControlLabel>
                        <FormControlLabelText>Açıklama</FormControlLabelText>
                      </FormControlLabel>
                      <Input>
                        <InputField
                          value={value ?? ''}
                          onChangeText={onChange}
                          placeholder="Lokasyon hakkında bilgiler"
                          multiline
                          numberOfLines={3}
                        />
                      </Input>
                    </FormControl>
                  )}
                />
              </VStack>
            </ScrollView>
            {createVenue.isError && (
              <Alert action="error" variant="solid" borderRadius="$md" mt="$4">
                <AlertIcon mr="$2" />
                <AlertText>Lokasyon oluşturulamadı. Bilgileri kontrol edin.</AlertText>
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack space="md" justifyContent="flex-end" width="100%">
              <Button variant="outline" action="secondary" onPress={handleClose}>
                <ButtonText>Vazgeç</ButtonText>
              </Button>
              <Button onPress={submitVenue} isDisabled={createVenue.isPending} action="primary">
                {createVenue.isPending ? (
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
