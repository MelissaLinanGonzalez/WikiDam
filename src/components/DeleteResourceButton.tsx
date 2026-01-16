'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteResourceButton({ resourceId }: { resourceId: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás segura de que quieres eliminar este recurso? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsDeleting(true);

        try {
            const res = await fetch(`/api/resources/${resourceId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/dashboard/resources');
                router.refresh();
            } else {
                alert('Error al eliminar el recurso');
                setIsDeleting(false);
            }
        } catch (error) {
            alert('Error de conexión');
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
        >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Eliminando...' : 'Eliminar recurso'}
        </button>
    );
}