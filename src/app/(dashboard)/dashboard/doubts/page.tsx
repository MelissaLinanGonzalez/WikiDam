'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDoubts, getDoubtById } from '@/actions/doubts';
import type { DoubtListItem, DoubtWithRelations } from '@/actions/doubts';
import DoubtsList from '@/components/doubts/DoubtsList';
import DoubtDetail from '@/components/doubts/DoubtDetail';
import CreateDoubtModal from '@/components/doubts/CreateDoubtModal';
import { MessageCircle } from 'lucide-react';

function DoubtsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedId = searchParams.get('id');

    const [doubts, setDoubts] = useState<DoubtListItem[]>([]);
    const [selectedDoubt, setSelectedDoubt] = useState<DoubtWithRelations>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Load all doubts
    useEffect(() => {
        const loadDoubts = async () => {
            setLoading(true);
            const data = await getDoubts();
            setDoubts(data);
            setLoading(false);
        };
        loadDoubts();
    }, []);

    // Load selected doubt details
    useEffect(() => {
        const loadDoubtDetail = async () => {
            if (selectedId) {
                setLoadingDetail(true);
                const data = await getDoubtById(selectedId);
                setSelectedDoubt(data);
                setLoadingDetail(false);
            } else {
                setSelectedDoubt(null);
            }
        };
        loadDoubtDetail();
    }, [selectedId]);

    const handleSelectDoubt = (id: string) => {
        router.push(`/dashboard/doubts?id=${id}`, { scroll: false });
    };

    const handleBack = () => {
        router.push('/dashboard/doubts', { scroll: false });
    };

    const handleNewDoubt = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        // Reload doubts after creating
        getDoubts().then(setDoubts);
    };

    // Reload when router refreshes
    useEffect(() => {
        const handleRefresh = async () => {
            const data = await getDoubts();
            setDoubts(data);
            if (selectedId) {
                const detailData = await getDoubtById(selectedId);
                setSelectedDoubt(detailData);
            }
        };

        // Listen for popstate/navigation
        window.addEventListener('focus', handleRefresh);
        return () => window.removeEventListener('focus', handleRefresh);
    }, [selectedId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)]">
            <div className="h-full flex rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                {/* Left Column - List */}
                <div
                    className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 ${selectedId ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
                        }`}
                >
                    <DoubtsList
                        doubts={doubts}
                        selectedDoubtId={selectedId}
                        onSelectDoubt={handleSelectDoubt}
                        onNewDoubt={handleNewDoubt}
                    />
                </div>

                {/* Right Column - Detail */}
                <div
                    className={`flex-1 flex flex-col ${selectedId ? 'flex' : 'hidden lg:flex'
                        }`}
                >
                    {loadingDetail ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        </div>
                    ) : selectedDoubt ? (
                        <DoubtDetail doubt={selectedDoubt} onBack={handleBack} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                                <MessageCircle className="w-10 h-10 text-primary-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                Selecciona una conversación
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                                Elige una duda de la lista para ver los detalles y respuestas, o crea una nueva duda.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <CreateDoubtModal isOpen={isModalOpen} onClose={handleModalClose} />
        </div>
    );
}

export default function DoubtsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        }>
            <DoubtsContent />
        </Suspense>
    );
}
