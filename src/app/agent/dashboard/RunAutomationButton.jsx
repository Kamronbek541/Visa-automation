
// 'use client';

// import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Calendar, Users } from 'lucide-react'; // Иконки для красоты

// export function RunAutomationButton({ applicationId, status }) {
//     const [isLoading, setIsLoading] = useState(false);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [bookingInstruction, setBookingInstruction] = useState(null);
//     const router = useRouter();

//     if (status !== 'PENDING' && status !== 'FAILED') {
//         return null;
//     }

//     const handleRun = async () => {
//         setIsLoading(true);

//         const response = await fetch('/api/agent/run-automation', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ applicationId }),
//         });
        
//         const result = await response.json();

//         if (response.ok && result.bookingInstruction) {
//             setBookingInstruction(result.bookingInstruction);
//             setIsDialogOpen(true);
//             // router.refresh() УБРАН ОТСЮДА
//         } else {
//             alert(`Error: ${result.message || 'Failed to start automation.'}`);
//         }

//         setIsLoading(false);
//     };

//     // ==========================================================
//     // НОВАЯ ФУНКЦИЯ ДЛЯ ЗАКРЫТИЯ ОКНА
//     // ==========================================================
//     const handleCloseDialog = () => {
//         setIsDialogOpen(false);
//         // Обновляем таблицу ТОЛЬКО ПОСЛЕ того, как пользователь нажал кнопку
//         router.refresh(); 
//     };

//     return (
//         <>
//             {/* --- Основная Кнопка --- */}
//             <Button
//                 size="sm"
//                 onClick={handleRun}
//                 disabled={isLoading}
//                 variant={status === 'FAILED' ? 'secondary' : 'default'}
//             >
//                 {isLoading ? 'Starting...' : (status === 'FAILED' ? 'Run Again' : 'Run Automation')}
//             </Button>

//             {/* --- Диалоговое Окно (Pop-up) --- */}
//             <Dialog 
//                 open={isDialogOpen} 
//                 onOpenChange={setIsDialogOpen} 
//                 modal={true}
//             >
//                 <DialogContent 
//                     className="sm:max-w-md" 
//                     onEscapeKeyDown={(e) => e.preventDefault()} 
//                     onPointerDownOutside={(e) => e.preventDefault()}
//                 >
//                     <DialogHeader>
//                         <DialogTitle className="text-2xl font-bold">Action Required</DialogTitle>
//                         <DialogDescription className="pt-2">
//                             The automation process has started. Please book a hotel with the following details.
//                         </DialogDescription>
//                     </DialogHeader>
                    
//                     {/* --- Тело сообщения --- */}
//                     <div className="py-4 space-y-4">
//                         <div className="p-4 bg-slate-50 rounded-lg">
//                             <div className="flex items-start space-x-4">
//                                 <Calendar className="h-6 w-6 text-slate-600 mt-1" />
//                                 <div>
//                                     <p className="font-semibold text-slate-800">Travel Dates</p>
//                                     <p className="text-slate-600">
//                                         Check-in: <span className="font-mono">{bookingInstruction?.checkIn}</span>
//                                     </p>
//                                     <p className="text-slate-600">
//                                         Check-out: <span className="font-mono">{bookingInstruction?.checkOut}</span>
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="p-4 bg-slate-50 rounded-lg">
//                              <div className="flex items-start space-x-4">
//                                 <Users className="h-6 w-6 text-slate-600 mt-1" />
//                                 <div>
//                                     <p className="font-semibold text-slate-800">Number of Guests</p>
//                                     <p className="text-slate-600">
//                                         Adults: <span className="font-bold">{bookingInstruction?.adults}</span>
//                                     </p>
//                                     <p className="text-slate-600">
//                                         Children: <span className="font-bold">{bookingInstruction?.children}</span>
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                          <p className="text-xs text-slate-500 pt-2">
//                             The system will use default hotel data for the visa form. You can update it later in the client's application if needed.
//                         </p>
//                     </div>

//                     <DialogFooter>
//                         {/* ИСПОЛЬЗУЕМ НОВУЮ ФУНКЦИЮ */}
//                         <Button onClick={handleCloseDialog}>Got it</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }

// src/app/agent/dashboard/RunAutomationButton.jsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users } from 'lucide-react';

export function RunAutomationButton({ applicationId, status }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [bookingInstruction, setBookingInstruction] = useState(null);
    const router = useRouter();

    if (status !== 'PENDING' && status !== 'FAILED') {
        return null;
    }

    const handleRun = async () => {
        setIsLoading(true);

        const response = await fetch('/api/agent/run-automation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId }),
        });
        
        const result = await response.json();

        if (response.ok && result.bookingInstruction) {
            const instruction = result.bookingInstruction;
            
            // ==========================================================
            // 1. СТРОИМ URL ДЛЯ BOOKING.COM
            // ==========================================================
            const bookingUrl = `https://www.booking.com/searchresults.html?ss=London&checkin=${instruction.checkInUrl}&checkout=${instruction.checkOutUrl}&group_adults=${instruction.adults}&group_children=${instruction.children}&no_rooms=1&nflt=fc%3D2%3Brs%3D1`;

            // ==========================================================
            // 2. ОТКРЫВАЕМ НОВУЮ ВКЛАДКУ В БРАУЗЕРЕ АГЕНТА
            // ==========================================================
            window.open(bookingUrl, '_blank');

            // 3. Показываем наш красивый pop-up
            setBookingInstruction(instruction);
            setIsDialogOpen(true);
            
        } else {
            alert(`Error: ${result.message || 'Failed to start automation.'}`);
        }

        setIsLoading(false);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        router.refresh(); 
    };

    return (
        <>
            <Button size="sm" onClick={handleRun} disabled={isLoading} variant={status === 'FAILED' ? 'secondary' : 'default'}>
                {isLoading ? 'Starting...' : (status === 'FAILED' ? 'Run Again' : 'Run Automation')}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
                <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Action Required</DialogTitle>
                        <DialogDescription className="pt-2">
                            A new tab has been opened for hotel booking. Please use these details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-start space-x-4">
                                <Calendar className="h-6 w-6 text-slate-600 mt-1" />
                                <div>
                                    <p className="font-semibold text-slate-800">Travel Dates</p>
                                    <p className="text-slate-600">
                                        Check-in: <span className="font-mono">{bookingInstruction?.checkInDisplay}</span>
                                    </p>
                                    <p className="text-slate-600">
                                        Check-out: <span className="font-mono">{bookingInstruction?.checkOutDisplay}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                             <div className="flex items-start space-x-4">
                                <Users className="h-6 w-6 text-slate-600 mt-1" />
                                <div>
                                    <p className="font-semibold text-slate-800">Number of Guests</p>
                                    <p className="text-slate-600">
                                        Adults: <span className="font-bold">{bookingInstruction?.adults}</span>
                                    </p>
                                    <p className="text-slate-600">
                                        Children: <span className="font-bold">{bookingInstruction?.children}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                         <p className="text-xs text-slate-500 pt-2">
                            The system will use default hotel data. You can update it after booking if needed.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCloseDialog}>Got it</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}