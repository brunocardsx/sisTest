import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './notaFiscal.css';

// ===================================================================
//  ÍCONES PARA UMA UI MAIS CLARA E MODERNA
// ===================================================================
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="btn-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="btn-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 00-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;

// ===================================================================
//  COMPONENTES DE UI ATUALIZADOS
// ===================================================================
const formatDate = (dateString) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(dateString));
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value) || 0);

// Componente para exibir os detalhes da nota (reutilizável)
const InvoiceDetails = ({ nota }) => (
    <div className="invoice-details-content">
        <div className="info-grid">
            <p><strong>Emissão:</strong> <span>{nota.data_emissao_formatada}</span></p>
            <p><strong>Obra:</strong> <span>{nota.obra_nome || 'N/A'}</span></p>
            <p><strong>Valor Total:</strong> <span>{formatCurrency(nota.valor_total_nota)}</span></p>
        </div>
        <h3 className="items-table-title">Itens da Nota</h3>
        <table className="items-table">
            <thead><tr><th>Produto</th><th className="text-right">Qtd</th><th className="text-right">Vl. Unit.</th><th className="text-right">Total</th></tr></thead>
            <tbody>
            {nota.itens.map((item, i) => (
                <tr key={i}>
                    <td data-label="Produto">{item.produto_nome}</td>
                    <td data-label="Qtd" className="text-right">{item.quantidade}</td>
                    <td data-label="Vl. Unit." className="text-right">{formatCurrency(item.valor_unitario)}</td>
                    <td data-label="Total" className="text-right">{formatCurrency(item.valor_total_item)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

// Componente que busca os detalhes da nota quando o card é expandido
const ExpandedInvoiceDetails = ({ notaId }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true); setError('');
            try {
                const { data } = await api.get(`/api/notas-fiscais/${notaId}`);
                if (data.status) {
                    const notaApi = data.data;
                    const itensCalculados = notaApi.itens.map(item => ({ ...item, valor_total_item: (parseFloat(item.quantidade) || 0) * (parseFloat(item.valor_unitario) || 0) }));
                    const valorTotalNotaCalculado = itensCalculados.reduce((sum, item) => sum + item.valor_total_item, 0);
                    setDetails({ ...notaApi, itens: itensCalculados, valor_total_nota: valorTotalNotaCalculado, data_emissao_formatada: formatDate(notaApi.data_emissao) });
                } else { setError(data.message || 'Erro ao carregar dados.'); }
            } catch (err) { setError(err.response?.data?.message || 'Falha na comunicação com o servidor.');
            } finally { setLoading(false); }
        };
        fetchDetails();
    }, [notaId]);

    if (loading) return <p className="details-feedback">Carregando detalhes...</p>;
    if (error) return <p className="details-feedback error">{error}</p>;
    if (!details) return null;

    return <InvoiceDetails nota={details} />;
};

// COMPONENTE PRINCIPAL DA LISTA, AGORA COM OS BOTÕES
const InvoicesList = ({ notas, expandedNotaId, onToggleDetails, onOpenDeleteModal }) => (
    <div className="nf-list-container">
        {notas.map((nota) => (
            <div key={nota.id} className={`nf-list-item ${expandedNotaId === nota.id ? 'expanded' : ''}`}>
                <div className="nf-item-header">
                    <div className="nf-item-info">
                        <span className="nf-item-numero">Nota #{nota.numero}</span>
                        <span className="nf-item-data">{nota.data_emissao_formatada}</span>
                        <span className="nf-item-valor">{formatCurrency(nota.valor_total_nota)}</span>
                    </div>
                    <div className="nf-item-actions">
                        <button className="btn btn-icon-only" onClick={() => onToggleDetails(nota.id)} title="Ver Detalhes">
                            <EyeIcon />
                        </button>
                        <button className="btn btn-icon-only btn-danger-outline" onClick={() => onOpenDeleteModal(nota)} title="Excluir Nota">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
                {expandedNotaId === nota.id && (
                    <div className="nf-item-details-wrapper">
                        <ExpandedInvoiceDetails notaId={nota.id} />
                    </div>
                )}
            </div>
        ))}
    </div>
);


// ===================================================================
//  PÁGINA PRINCIPAL
// ===================================================================

export default function NotaFiscal() {
    // ESTADO PARA CONTROLAR QUAL NOTA ESTÁ EXPANDIDA
    const [expandedNotaId, setExpandedNotaId] = useState(null);

    // Outros estados...
    const [notasFiltradas, setNotasFiltradas] = useState([]);
    const [msgLista, setMsgLista] = useState({ type: '', text: '' });
    const [loadingLista, setLoadingLista] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notaToDelete, setNotaToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Função para abrir/fechar os detalhes
    const handleToggleDetails = (notaId) => {
        setExpandedNotaId(prevId => (prevId === notaId ? null : notaId));
    };

    const buscarNotasPorData = async (e) => {
        e.preventDefault();
        const dataInicio = e.target.elements.dataInicio.value;
        const dataFim = e.target.elements.dataFim.value;
        if (!dataInicio || !dataFim) return setMsgLista({ type: 'error', text: 'As datas são obrigatórias.' });
        setLoadingLista(true); setNotasFiltradas([]); setExpandedNotaId(null);
        try {
            const { data } = await api.get(`/api/notas-fiscais/por-data?data_inicio=${dataInicio}&data_fim=${dataFim}`);
            const notas = data.status ? data.data.map(nf => ({ ...nf, data_emissao_formatada: formatDate(nf.data_emissao) })) : [];
            setNotasFiltradas(notas);
            setMsgLista({ type: notas.length > 0 ? '' : 'info', text: notas.length > 0 ? '' : data.message });
        } catch (err) { setMsgLista({ type: 'error', text: err.response?.data?.message || "Erro ao buscar notas." });
        } finally { setLoadingLista(false); }
    };

    const handleDeleteNota = async () => {
        if (!notaToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/notas-fiscais/${notaToDelete.id}`);
            setNotasFiltradas(prev => prev.filter(n => n.id !== notaToDelete.id));
            setMsgLista({ type: 'success', text: 'Nota fiscal excluída com sucesso.' });
        } catch (err) { setMsgLista({ type: 'error', text: err.response?.data?.message || 'Erro ao excluir.' });
        } finally { setIsDeleting(false); setIsDeleteModalOpen(false); setNotaToDelete(null); }
    };

    const handleOpenDeleteModal = (nota) => { setNotaToDelete(nota); setIsDeleteModalOpen(true); };

    // Removi a busca por número para simplificar, mas você pode adicionar de volta se quiser
    return (
        <>
            <div className="nf-page-wrapper single-column">
                <div className="nf-card">
                    <h2 className="nf-card-title">Listar Notas por Período</h2>
                    <form onSubmit={buscarNotasPorData}>
                        <div className="date-form-grid">
                            <div className="form-group"><label htmlFor="dataInicio">Data de Início</label><input id="dataInicio" name="dataInicio" type="date" className="form-input" /></div>
                            <div className="form-group"><label htmlFor="dataFim">Data de Fim</label><input id="dataFim" name="dataFim" type="date" className="form-input" /></div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full-width" disabled={loadingLista}>
                            {loadingLista ? "Buscando..." : "Listar Notas"}
                        </button>
                    </form>

                    {msgLista.text && <div className={`feedback-message ${msgLista.type}`}>{msgLista.text}</div>}

                    {loadingLista && <p className="loading-text">Carregando notas...</p>}

                    {!loadingLista && notasFiltradas.length > 0 && (
                        <InvoicesList
                            notas={notasFiltradas}
                            expandedNotaId={expandedNotaId}
                            onToggleDetails={handleToggleDetails}
                            onOpenDeleteModal={handleOpenDeleteModal}
                        />
                    )}
                </div>
            </div>
            <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteNota} nota={notaToDelete} isDeleting={isDeleting} />
        </>
    );
}