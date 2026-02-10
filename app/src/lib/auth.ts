import { type NextAuthOptions, getServerSession } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { db } from './db';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        })
    ],
    callbacks: {
        async session({ token, session }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.plan = token.plan as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            const dbUser = await db.user.findFirst({
                where: { email: token.email! }
            });

            if (!dbUser) {
                if (user) {
                    token.id = user.id;
                }
                return token;
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
                plan: dbUser.plan
            };
        }
    }
};

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user;
}

// Extend NextAuth types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            plan: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        plan: string;
    }
}
