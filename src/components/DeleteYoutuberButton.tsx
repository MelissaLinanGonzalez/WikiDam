'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteYoutuberButton({ youtuberId }: { youtuberId: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás segura de que quieres eliminar este YouTuber? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsDeleting(true);

        try {
            const res = await fetch(`/api/youtubers/${youtuberId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Error al eliminar el YouTuber');
                setIsDeleting(false);
            }
        } catch {
            alert('Error de conexión');
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Eliminar YouTuber"
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
