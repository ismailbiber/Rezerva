import {
  Box,
  Button,
  ButtonText,
  HStack,
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '../contexts/AuthContext';

const navItems = [
  { label: 'Gösterge Paneli', path: '/dashboard' },
  { label: 'Rezervasyonlar', path: '/reservations' },
  { label: 'Lokasyonlar', path: '/venues' }
];

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <Box flex={1} minHeight="100vh" bg="$backgroundLight100">
      <Box bg="$primary600" px="$6" py="$4">
        <HStack alignItems="center" justifyContent="space-between" space="md" flexWrap="wrap">
          <Text color="$textLight0" fontSize="$xl" fontWeight="$bold">
            Rezerva
          </Text>
          <HStack space="md" flexWrap="wrap" alignItems="center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Pressable
                  key={item.path}
                  onPress={() => handleNavigate(item.path)}
                  px="$3"
                  py="$2"
                  borderRadius="$md"
                  bg={isActive ? '$primary500' : 'transparent'}
                >
                  <Text
                    color={isActive ? '$textLight0' : '$textLight200'}
                    fontWeight={isActive ? '$bold' : '$semibold'}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
          <HStack alignItems="center" space="md">
            <VStack>
              <Text color="$textLight0" fontWeight="$semibold">
                {user?.full_name ?? user?.email}
              </Text>
              <Text color="$textLight200" fontSize="$xs">
                Yönetici Paneli
              </Text>
            </VStack>
            <Button variant="outline" action="secondary" borderColor="$primary200" onPress={logout}>
              <ButtonText>Çıkış Yap</ButtonText>
            </Button>
          </HStack>
        </HStack>
      </Box>

      <Box flex={1} width="100%" alignItems="center" py="$6" px="$4">
        <Box width="100%" maxWidth="1200px">
          <Outlet />
        </Box>
      </Box>

      <Box borderTopWidth="$1" borderColor="$borderLight200" py="$4" alignItems="center">
        <Text color="$textLight500" fontSize="$sm">
          © {new Date().getFullYear()} Rezerva. Tüm hakları saklıdır.
        </Text>
      </Box>
    </Box>
  );
};
