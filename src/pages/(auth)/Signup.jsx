import { SignupForm } from '@/components/signup-form'
import React from 'react'

const Signup = () => {
  return (
    <div className='h-screen flex items-center justify-center'>
        <div className='max-w-md mx-auto'>
            <SignupForm className="shaddow shadow-xl rounded-xl p-5" />
        </div>
    </div>
  )
}

export default Signup