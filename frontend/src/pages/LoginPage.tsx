import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertIcon,
  AlertText,
  Box,
  Button,
  ButtonText,
  Center,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Heading,
  Input,
  InputField,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { useAuthContext } from '../contexts/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login, user, loading } = useAuthContext();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  const handleLogin = handleSubmit(async (values: LoginForm) => {
    setAuthError(null);
    try {
      await login(values.email, values.password);
    } catch (error) {
      setAuthError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  });

  return (
    <Center flex={1} minHeight="100vh" bg="$backgroundLight100" px="$6">
      <Box
        width="100%"
        maxWidth={420}
        bg="$backgroundLight0"
        p="$6"
        borderRadius="$xl"
        shadowColor="$backgroundDark950"
        shadowOffset={{ width: 0, height: 12 }}
        shadowOpacity={0.08}
        shadowRadius={24}
      >
        <VStack space="lg">
          <VStack space="xs">
            <Heading size="lg">Rezerva Yönetim Paneli</Heading>
            <Text color="$textLight500">Lütfen hesabınıza giriş yapın.</Text>
          </VStack>

          <VStack space="md">
            <Controller
              name="email"
              control={control}
              rules={{ required: 'E-posta zorunludur' }}
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <FormControl isInvalid={Boolean(fieldState.error)}>
                  <FormControlLabel>
                    <FormControlLabelText>E-posta</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="ornek@rezerva.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
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
              name="password"
              control={control}
              rules={{ required: 'Şifre zorunludur' }}
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <FormControl isInvalid={Boolean(fieldState.error)}>
                  <FormControlLabel>
                    <FormControlLabelText>Şifre</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="••••••••"
                      type="password"
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
          </VStack>

          {authError && (
            <Alert action="error" variant="solid" borderRadius="$md">
              <AlertIcon mr="$2" />
              <AlertText>{authError}</AlertText>
            </Alert>
          )}

          <Button onPress={handleLogin} isDisabled={isSubmitting} action="primary">
            {isSubmitting ? (
              <HStack alignItems="center" space="sm">
                <Spinner color="$textLight0" />
                <ButtonText>Giriş yapılıyor...</ButtonText>
              </HStack>
            ) : (
              <ButtonText>Giriş Yap</ButtonText>
            )}
          </Button>

          {loading && !user && (
            <Alert action="muted" variant="accent" borderRadius="$md">
              <AlertIcon mr="$2" />
              <AlertText>Kullanıcı bilgileri yükleniyor...</AlertText>
            </Alert>
          )}
        </VStack>
      </Box>
    </Center>
  );
};
