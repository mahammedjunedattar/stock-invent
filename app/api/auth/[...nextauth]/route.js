// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import clientPromise from '@/app/lib/db';   // should export a MongoClient promise

// Zod schema for credentials validation
const credentialsSchema = z.object({
  email:    z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input format
        const parsed = await credentialsSchema.safeParseAsync(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Look up user in DB
        const client = await clientPromise;
        const db     = client.db();               // or .db('stores')
        const user   = await db.collection('users').findOne({ email });
        if (!user || !user.password) return null;

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Return the user object (id is required)
        return {
          id:      user._id.toString(),
          email:   user.email,
          name:    user.name,
          storeId: user.storeId,
          role:    user.role ?? 'user',
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // On first sign in, attach storeId/role to the token
      if (user) {
        token.storeId = user.storeId;
        token.role    = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Make storeId/role available on the client
      session.user.storeId = token.storeId;
      session.user.role    = token.role;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error:  '/auth/error',
  },

  // Ensure this matches your environment variable
  secret: process.env.NEXTAUTH_SECRET,

  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug:            process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

