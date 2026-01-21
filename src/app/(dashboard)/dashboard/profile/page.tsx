'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/UserAvatar';
import { useUploadThing } from '@/lib/uploadthing';
import { updateProfile } from '@/actions/users';
import { Camera, Save, User, Mail, Briefcase, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();

    // Initial state based on session
    const [name, setName] = useState(session?.user?.name || '');
    const [contactEmail, setContactEmail] = useState(''); // We'll need to fetch this or update schema to include in session if needed often
    // Note: session.user.role is mapped, but occupation isn't in default session type yet. 
    // Ideally update auth.ts session callback to include occupation. 
    // For now we assume default/fetch or just let user select.
    const [occupation, setOccupation] = useState<'STUDENT' | 'WORKER' | 'PROFESSOR'>('STUDENT');
    const [image, setImage] = useState(session?.user?.image || '');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const { startUpload } = useUploadThing('profileImage', {
        onClientUploadComplete: (res: { url: string }[]) => {
            if (res && res[0]) {
                setImage(res[0].url);
                setUploading(false);
            }
        },
        onUploadError: () => {
            setUploading(false);
            setError('Error al subir la imagen');
        },
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setUploading(true);
        startUpload(Array.from(e.target.files));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await updateProfile({
                name,
                contactEmail,
                occupation,
                image
            });

            if (res.success) {
                // Update client session
                await updateSession({ name, image });
                setSuccess('Perfil actualizado correctamente');
                router.refresh();
            } else {
                setError(res.error || 'Error al actualizar');
            }
        } catch {
            setError('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mi Perfil</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona tu información personal y pública</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center justify-center gap-4 py-4">
                            <div className="relative group cursor-pointer">
                                <UserAvatar
                                    name={name || 'User'}
                                    image={image}
                                    className="w-32 h-32 text-4xl"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    disabled={uploading}
                                />
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Haz clic en la imagen para cambiarla
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 transition-all"
                                    required
                                />
                            </div>

                            {/* Occupation */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Ocupación
                                </label>
                                <select
                                    value={occupation}
                                    onChange={(e) => setOccupation(e.target.value as any)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 transition-all"
                                >
                                    <option value="STUDENT">Estudiante</option>
                                    <option value="WORKER">Trabajador</option>
                                    <option value="PROFESSOR">Profesor</option>
                                </select>
                            </div>

                            {/* Contact Email */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email de Contacto (Público)
                                </label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="ejemplo@contacto.com (Opcional)"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 transition-all"
                                />
                                <p className="text-xs text-slate-500">
                                    Este email será visible para otros usuarios si deciden contactarte.
                                </p>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {success && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span>{success}</span>
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
