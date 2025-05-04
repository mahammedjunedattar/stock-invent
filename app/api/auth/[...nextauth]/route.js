// app/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/app/lib/db';
import { clientPromise } from '@/app/lib/db';
// Enhanced validation schema
const credentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const authOptions = {
  // Proper MongoDB adapter configuration
  adapter: MongoDBAdapter(
    Promise.resolve({
      client: connectToDB().then(({ client }) => client),
      db: connectToDB().then(({ db }) => db)
    })
  ),

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate input format
          const { email, password } = await credentialsSchema.parseAsync(credentials);

          // Database connection
          const { db } = await connectToDB();
          
          // Find user with email
          const user = await db.collection('users').findOne({ email });
          if (!user) return null;

          // Verify password
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return null;

          // Return essential user data
          return { 
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user'
          };

        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],

  // Session management
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks for session handling
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
          token.storeId = user.storeId;
        }
        return token;
      },
      async session({ session, token }) {
        session.user.storeId = token.storeId;
        return session;
      }
    }
    ,

  // Pages configuration
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },

  // Security settings
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  trustHost: true
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };