import NextAuth from 'next-auth';
import { authOptions } from '@/utils/auth';

/**
 * NextAuth configuration is imported from @/utils/auth
 * This allows us to reuse authOptions in getServerSession() calls
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
