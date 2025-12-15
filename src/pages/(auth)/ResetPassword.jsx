import ResetPasswordForm from '@/components/reset-password-form'
import React from 'react'

const ResetPassword = () => {
  return (
    <div className='h-screen flex items-center justify-center'>
        <div className='max-w-md mx-auto'>
            <ResetPasswordForm />
        </div>
    </div>
  )
}

export default ResetPassword