import { LoginForm } from '@features/auth/login'
import { Button } from '@shared/ui/Button/Button.tsx'
import { Card } from '@shared/ui/Card/Card.tsx'
import { useState } from 'react'
import { RegisterForm } from '@features/auth/register'
import './LoginPage.css'

export const LoginPage = () => {

  const [isLogin, setIsLogin] = useState(true)
  
  const handleRegistrationSuccess = () => {
    setIsLogin(true)
  }

  return (
    <main className="auth-page">
      <div className='login-brand-footer'>
        MJT
      </div>
    <Card>
      <header className="auth-header">
        <h1>{isLogin ? 'Bem vindo de volta' : 'Criar conta'}</h1>
        <p>{isLogin ? 'Entre na sua conta' : 'Junte-se ao nosso sistema de estoque'}</p>
      </header>

      {isLogin ? <LoginForm /> : <RegisterForm onSuccess={handleRegistrationSuccess} />}
      <footer className='auth-footer'>
        <p>
          {isLogin ? 'Ainda nao se inscreveu?' : 'Ja se inscreveu?'}
          <Button onClick={() => setIsLogin(!isLogin)}
          className='btn-toggle'
          >
            {isLogin ? 'Inscreva-se' : 'Entrar'}
          </Button>
        </p>
        </footer>
    </Card>
    </main>
  )
}
