import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: 'STUDENT',
                    occupation: 'STUDENT', // Default for Google users
                }
            },
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email y contraseña son requeridos');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error('Usuario no encontrado');
                }

                // If user has no password (e.g. created via Google), they can't login with credentials unless they set one.
                // But for now we just fail.
                if (!user.password) {
                    throw new Error('Inicia sesión con Google');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error('Contraseña incorrecta');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                    occupation: user.occupation
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                if (!user.email) return false;

                // Check if user exists
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (!dbUser) {
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || '',
                            image: user.image,
                            password: '', // No password for OAuth
                            occupation: 'STUDENT',
                            role: 'STUDENT',
                        },
                    });
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // Update token if user just updated their profile
            if (trigger === 'update' && session?.name) {
                token.name = session.name;
                token.picture = session.image;
            }

            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.picture = user.image;
                // @ts-ignore
                token.occupation = user.occupation;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
                session.user.image = token.picture;
                // @ts-ignore
                session.user.occupation = token.occupation;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
