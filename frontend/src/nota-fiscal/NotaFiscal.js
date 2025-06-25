// src/nota-fiscal/NotaFiscal.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './notaFiscal.css';

// Ícone
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="btn-icon"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 00-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;

// Helpers
const formatDate = (dateString) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(dateString));
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value) || 0);

// --- COMPONENTES DE UI ---

const SearchByNumber = ({ onSubmit, isLoading, msg }) => (
    <><h2 className="nf-card-title">Consultar por Número</h2><form onSubmit={onSubmit} className="form-wrapper"><div className="form-group"><label htmlFor="numeroNotaConsulta">Número da Nota Fiscal</label><input id="numeroNotaConsulta" name="numero" type="text" className="form-input" placeholder="Digite o número" disabled={isLoading} /></div><button type="submit" className="btn btn-primary btn-full-width" disabled={isLoading}>{isLoading ? "Buscando..." : "Buscar Nota"}</button>{msg.text && <div className={`feedback-message ${msg.type}`}>{msg.text}</div>}</form></>
);

const SearchByDate = ({ onSubmit, isLoading, msg }) => (
    <><h2 className="nf-card-title">Listar por Período</h2><form onSubmit={onSubmit} className="form-wrapper"><div className="date-form-grid"><div className="form-group"><label htmlFor="dataInicio">Data de Início</label><input id="dataInicio" name="dataInicio" type="date" className="form-input" disabled={isLoading} /></div><div className="form-group"><label htmlFor="dataFim">Data de Fim</label><input id="dataFim" name="dataFim" type="date" className="form-input" disabled={isLoading} /></div></div><button type="submit" className="btn btn-primary btn-full-width" disabled={isLoading}>{isLoading ? "Buscando..." : "Listar Notas"}</button>{msg.text && <div className={`feedback-message ${msg.type}`}>{msg.text}</div>}</form></>
);

const InvoiceDetails = ({ nota, onOpenDeleteModal }) => (
    <div className="results-container">
        <div className="info-grid">
            <p><strong>Emissão:</strong> <span>{formatDate(nota.data_emissao)}</span></p>
            <p><strong>Obra:</strong> <span>{nota.obra_nome || 'N/A'}</span></p>
            <p><strong>Valor Total:</strong> <span>{formatCurrency(nota.valor_total_nota)}</span></p>
        </div>
        <h3 className="items-table-title">Itens da Nota</h3>
        <table className="items-table">
            <thead><tr><th>Produto</th><th className="text-right">Qtd</th><th className="text-right">Vl. Unit.</th><th className="text-right">Total</th></tr></thead>
            <tbody>
            {nota.itens && nota.itens.map((item) => (
                <tr key={item.id}>
                    <td data-label="Produto">{item.produto_nome || 'Produto não identificado'}</td>
                    <td data-label="Qtd" className="text-right">{item.quantidade}</td>
                    <td data-label="Vl. Unit." className="text-right">{formatCurrency(item.valor_unitario)}</td>
                    <td data-label="Total" className="text-right">{formatCurrency(item.valor_total)}</td>
                </tr>
            ))}
            </tbody>
        </table>
        {onOpenDeleteModal && (<button className="btn btn-danger" onClick={() => onOpenDeleteModal(nota)}>Excluir Nota Fiscal</button>)}
    </div>
);

const ExpandedInvoiceDetails = ({ notaId, onOpenDeleteModal }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/api/notas-fiscais/${notaId}`);
                if (data.status) setDetails(data.data);
                else setError(data.message);
            } catch (err) {
                setError(err.response?.data?.message || 'Falha na comunicação.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [notaId]);

    if (loading) return <p className="details-feedback">Carregando detalhes...</p>;
    if (error) return <p className="details-feedback error">{error}</p>;
    if (!details) return null;

    return <InvoiceDetails nota={details} onOpenDeleteModal={onOpenDeleteModal} />;
};

const InvoicesList = ({ notas, onOpenDeleteModal, expandedNotaId, onToggleDetails }) => (
    <div className="nf-list-container">
        {notas.map((nota) => (
            <div key={nota.id} className={`nf-list-item ${expandedNotaId === nota.id ? 'expanded' : ''}`}>
                <div className="nf-item-header" onClick={() => onToggleDetails(nota.id)}>
                    <div className="nf-item-info"><span className="nf-item-numero">Nota #{nota.numero}</span><span className="nf-item-data">{formatDate(nota.data_emissao)}</span></div>
                    <span className="nf-item-valor">{formatCurrency(nota.valor_total_nota)}</span>
                </div>
                {expandedNotaId === nota.id && (
                    <div className="nf-item-details-wrapper">
                        <ExpandedInvoiceDetails notaId={nota.id} onOpenDeleteModal={onOpenDeleteModal} />
                    </div>
                )}
            </div>
        ))}
    </div>
);

const DeleteModal = ({ isOpen, onClose, onConfirm, nota, isDeleting }) => {
    if (!isOpen) return null;
    return (<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}><h2>Confirmar Exclusão</h2><p>Deseja excluir a nota fiscal nº <strong className="item-to-delete">{nota?.numero}</strong>?</p><p className="delete-warning">Esta ação não pode ser desfeita.</p><div className="modal-actions"><button className="btn-modal cancel" onClick={onClose} disabled={isDeleting}>Cancelar</button><button className="btn-modal danger" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</button></div></div></div>);
};

// --- COMPONENTE PRINCIPAL ---
export default function NotaFiscal() {
    const [notaFiscalDetalhe, setNotaFiscalDetalhe] = useState(null);
    const [notasFiltradas, setNotasFiltradas] = useState([]);
    const [msgConsulta, setMsgConsulta] = useState({ type: '', text: '' });
    const [msgLista, setMsgLista] = useState({ type: '', text: '' });
    const [loadingConsulta, setLoadingConsulta] = useState(false);
    const [loadingLista, setLoadingLista] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notaToDelete, setNotaToDelete] = useState(null);
    const [expandedNotaId, setExpandedNotaId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggleDetails = (notaId) => setExpandedNotaId(prevId => (prevId === notaId ? null : notaId));

    const handleOpenDeleteModal = (nota) => {
        setNotaToDelete(nota);
        setIsDeleteModalOpen(true);
    };

    const buscarNotaPorNumero = async (e) => {
        e.preventDefault();
        const numero = e.target.elements.numero.value;
        if (!numero.trim()) return setMsgConsulta({ type: 'error', text: 'Digite o número da nota.' });
        setLoadingConsulta(true);
        setNotaFiscalDetalhe(null);
        setMsgConsulta({ type: '', text: '' });
        try {
            const { data } = await api.get(`/api/notas-fiscais/numero/${numero.trim()}`);
            if (data.status) setNotaFiscalDetalhe(data.data);
            else setMsgConsulta({ type: 'error', text: data.message });
        } catch (err) {
            setMsgConsulta({ type: 'error', text: err.response?.data?.message || "Erro ao buscar nota." });
        } finally {
            setLoadingConsulta(false);
        }
    };

    const buscarNotasPorData = async (e) => {
        e.preventDefault();
        const { dataInicio, dataFim } = e.target.elements;
        if (!dataInicio.value || !dataFim.value) return setMsgLista({ type: 'error', text: 'As datas são obrigatórias.' });
        setLoadingLista(true);
        setNotasFiltradas([]);
        setExpandedNotaId(null);
        setMsgLista({ type: '', text: '' });
        try {
            const { data } = await api.get(`/api/notas-fiscais/por-data?data_inicio=${dataInicio.value}&data_fim=${dataFim.value}`);
            if (data.status) {
                setNotasFiltradas(data.data);
                setMsgLista({ type: data.data.length > 0 ? '' : 'info', text: data.message || '' });
            } else {
                setMsgLista({ type: 'error', text: data.message });
            }
        } catch (err) {
            setMsgLista({ type: 'error', text: err.response?.data?.message || "Erro ao buscar notas." });
        } finally {
            setLoadingLista(false);
        }
    };

    const handleDeleteNota = async () => {
        if (!notaToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/notas-fiscais/${notaToDelete.id}`);
            setMsgLista({ type: 'success', text: 'Nota fiscal excluída com sucesso.' });
            if (notaFiscalDetalhe?.id === notaToDelete.id) setNotaFiscalDetalhe(null);
            setNotasFiltradas(prev => prev.filter(n => n.id !== notaToDelete.id));
            if (expandedNotaId === notaToDelete.id) setExpandedNotaId(null);
        } catch (err) {
            setMsgLista({ type: 'error', text: err.response?.data?.message || 'Erro ao excluir.' });
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setNotaToDelete(null);
        }
    };

    return (
        <>
            <div className="nf-page-wrapper">
                <div className="nf-card">
                    <SearchByNumber onSubmit={buscarNotaPorNumero} isLoading={loadingConsulta} msg={msgConsulta} />
                    {notaFiscalDetalhe && <InvoiceDetails nota={notaFiscalDetalhe} onOpenDeleteModal={handleOpenDeleteModal} />}
                </div>
                <div className="nf-card">
                    <SearchByDate onSubmit={buscarNotasPorData} isLoading={loadingLista} msg={msgLista} />
                    {notasFiltradas.length > 0 && (
                        <InvoicesList
                            notas={notasFiltradas}
                            onOpenDeleteModal={handleOpenDeleteModal}
                            expandedNotaId={expandedNotaId}
                            onToggleDetails={handleToggleDetails}
                        />
                    )}
                </div>
            </div>
            <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteNota} nota={notaToDelete} isDeleting={isDeleting} />
        </>
    );
}