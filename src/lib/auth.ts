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
                    id: profile.sub, // This is Google's ID, will be overwritten in JWT callback
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: 'STUDENT',
                    occupation: 'STUDENT',
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

                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (!dbUser) {
                    // Create new user with Google profile data (first time login)
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || '',
                            image: user.image, // Only set Google image for NEW users
                            password: '',
                            occupation: 'STUDENT',
                            role: 'STUDENT',
                        },
                    });
                }
                // For existing users: Do NOT update the image from Google.
                // This allows users to have a custom WikiDam profile picture
                // different from their Google account.
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // Handle profile updates
            if (trigger === 'update' && session?.name) {
                token.name = session.name;
                token.picture = session.image;
            }

            // CRITICAL FIX: Always fetch the real DB user ID by email
            // This ensures we use the CUID from our database, not the Google SUB ID
            const email = token.email || user?.email;

            if (email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: email as string },
                    select: {
                        id: true,
                        role: true,
                        image: true,
                        occupation: true,
                    },
                });

                if (dbUser) {
                    token.id = dbUser.id; // Use DB CUID, not provider ID
                    token.role = dbUser.role;
                    token.picture = dbUser.image; // Always use WikiDam DB image
                    // @ts-ignore
                    token.occupation = dbUser.occupation;
                }
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
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
