import ForgotPasswordForm from '@/components/forgot-password-form'
import React from 'react'

const ForgotPassword = () => {
  return (
    <div className='h-screen flex items-center justify-center'>
        <div className='max-w-md mx-auto'>
            <ForgotPasswordForm />
        </div>
    </div>
  )
}

export default ForgotPassword