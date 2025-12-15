import { LoginForm } from '@/components/login-form'
import React from 'react'

const Login = () => {
  return (
    <div className='h-screen flex items-center justify-center'>
        <div className='max-w-md mx-auto'>
            <LoginForm className="shaddow shadow-xl rounded-xl p-5" />
        </div>
    </div>
  )
}

export default Login