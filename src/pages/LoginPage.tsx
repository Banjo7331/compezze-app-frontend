import { Container } from '@mui/material';
import { LoginForm } from '@/features/auth/components/LoginForm'; // 1. Import!

const LoginPage = () => {
  return (
    <Container
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      {/* 2. Użycie komponentu */}
      <LoginForm />
    </Container>
  );
};

export default LoginPage;