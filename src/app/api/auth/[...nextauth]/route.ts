import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ethers } from 'ethers';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Web3',
      credentials: {
        address: { label: 'Wallet Address', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature) {
          return null;
        }

        try {
          // Verify the signature
          const message = `Sign in to FourierFi with address: ${credentials.address}`;
          const recoveredAddress = ethers.verifyMessage(message, credentials.signature);

          if (recoveredAddress.toLowerCase() !== credentials.address.toLowerCase()) {
            return null;
          }

          // Return user object
          return {
            id: credentials.address,
            address: credentials.address,
            name: `Wallet ${credentials.address.slice(0, 6)}...${credentials.address.slice(-4)}`,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.address = token.address as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 