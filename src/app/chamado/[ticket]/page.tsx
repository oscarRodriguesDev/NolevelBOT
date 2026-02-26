'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
// Usando ícones do pacote Lucide (via react-icons) para um visual mais técnico
import { LuHardHat, LuCheck, LuLoader, LuArrowRight } from 'react-icons/lu';

export default function TicketPage() {
    const params = useParams();
    const ticketId = params.ticket;

    const [formData, setFormData] = useState({
        userName: '',
        contract: '',
        reason: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            console.log('Enviando chamado:', { ticketId, ...formData });
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitted(true);
        } catch (error) {
            alert('Erro ao processar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
                <div className="bg-[#262626] rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-[#333]">
                    <LuCheck className="h-16 w-16 text-[#f59e0b] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Solicitação Enviada!</h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        O protocolo <span className="text-[#f59e0b] font-mono font-bold">#{ticketId}</span> foi gerado e enviado para a matriz.
                    </p>
                    <button 
                        onClick={() => window.close()} 
                        className="w-full bg-[#f59e0b] text-black py-4 rounded-xl font-bold hover:bg-[#d97706] transition-all"
                    >
                        Concluído
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white pb-12 font-sans">
            {/* Header com Estilo Industrial */}
            <div className="bg-[#1a1a1a] border-b border-[#333] p-8 mb-8">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#f59e0b] p-2 rounded-lg">
                            <LuHardHat className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black uppercase tracking-tighter">Nolevel Suporte</h1>
                            <p className="text-[#f59e0b] text-[10px] font-bold tracking-[0.2em] uppercase">Setor de Operações</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-500 text-[10px] block uppercase">ID do Ticket</span>
                        <span className="font-mono text-sm text-gray-300">#{ticketId}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4">
                <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-[#333] shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Nome do Colaborador
                            </label>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-4 bg-[#262626] border border-[#333] rounded-2xl focus:border-[#f59e0b] outline-none transition-all text-white placeholder-gray-600"
                                placeholder="Digite seu nome completo"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Contrato / Unidade
                            </label>
                            <div className="relative">
                                <select
                                    name="contract"
                                    value={formData.contract}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-[#262626] border border-none rounded-2xl focus:ring-1 focus:ring-[#f59e0b] outline-none appearance-none text-white transition-all cursor-pointer"
                                >
                                    <option value="">Selecione seu local</option>
                                    <option value="vitoria">Vitória - Matriz</option>
                                    <option value="serra">Serra - Logística</option>
                                    <option value="vale">Vale Tubarão</option>
                                    <option value="arcelor">ArcelorMittal</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <LuArrowRight className="rotate-90 h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Detalhes da Ocorrência
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-5 py-4 bg-[#262626] border border-[#333] rounded-2xl focus:border-[#f59e0b] outline-none transition-all text-white placeholder-gray-600 resize-none"
                                placeholder="Descreva o problema de forma clara..."
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#f59e0b] active:scale-95 text-black font-black py-5 rounded-2xl shadow-xl shadow-[#f59e0b]/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-sm tracking-tighter"
                            >
                                {loading ? (
                                    <>
                                        <LuLoader className="animate-spin h-5 w-5" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        Enviar Chamado
                                        <LuArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="flex justify-center items-center gap-2 mt-10">
                    <div className="h-[1px] w-8 bg-gray-800"></div>
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                        Nolevel Operations v2.0
                    </p>
                    <div className="h-[1px] w-8 bg-gray-800"></div>
                </div>
            </div>
        </div>
    );
}