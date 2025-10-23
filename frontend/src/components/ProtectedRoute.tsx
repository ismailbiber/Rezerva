import { Navigate, Outlet } from 'react-router-dom';
import { Center, Spinner, Text, VStack } from '@gluestack-ui/themed';

import { useAuthContext } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <Center flex={1} minHeight="100vh" px="$4">
        <VStack space="sm" alignItems="center">
          <Spinner size="large" />
          <Text color="$textLight700">Yükleniyor...</Text>
        </VStack>
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
