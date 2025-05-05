// app/login/page.js
'use client';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default function LoginPage() {
    const [error,setError] =  useState('')

  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

// app/login/page.js
const onSubmit = async (data) => {
  try {
  e.preventDefault();
  const result = await signIn('credentials', { // Match provider ID
    redirect: false,
    email: credentials.email,
    password: credentials.password
  });


    if (result?.error) {
      // Detailed error messages
      let errorMessage = 'Login failed';
      if (result.error.includes('CredentialsSignin')) {
        errorMessage = 'Invalid email or password';
      }
      setError(errorMessage);
    } else {
        localStorage.setItem('user',result.sub)

      router.refresh();
      router.push('/Dashboard');
    }
  } catch (error) {
    setError('An unexpected error occurred');
  }
};
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        
        <div className="text-center mt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
