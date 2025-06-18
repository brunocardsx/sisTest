import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './notaFiscal.css';

// ===================================================================
//  1. COMPONENTES DE UI (PRESENTATIONAL)
// ===================================================================

const formatDate = (dateString) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(dateString));
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value) || 0);

const SearchByNumber = ({ numero, setNumero, onSubmit, isLoading, msg }) => (
    <>
        <h2 className="nf-card-title">Consultar por Número</h2>
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <label htmlFor="numeroNotaConsulta">Número da Nota Fiscal</label>
                <input id="numeroNotaConsulta" type="text" className="form-input" placeholder="Digite o número" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={isLoading} />
            </div>
            <button type="submit" className="btn btn-primary btn-full-width" disabled={isLoading}>
                {isLoading ? "Buscando..." : "Buscar Nota"}
            </button>
        </form>
        {msg.text && <div className={`feedback-message ${msg.type}`}>{msg.text}</div>}
    </>
);

const InvoiceDetails = ({ nota, onOpenDeleteModal }) => (
    <div className="results-container">
        <div className="info-grid">
            <p><strong>Emissão:</strong> <span>{nota.data_emissao_formatada}</span></p>
            <p><strong>Obra:</strong> <span>{nota.obra_nome || 'N/A'}</span></p>
            <p><strong>Valor Total:</strong> <span>{formatCurrency(nota.valor_total_nota)}</span></p>
        </div>
        <table className="items-table">
            <thead><tr><th>Produto</th><th className="text-right">Qtd</th><th className="text-right">Vl. Unit.</th><th className="text-right">Total</th></tr></thead>
            <tbody>
            {nota.itens.map((item, i) => (
                <tr key={i}>
                    <td>{item.produto_nome}</td>
                    <td className="text-right">{item.quantidade}</td>
                    <td className="text-right">{formatCurrency(item.valor_unitario)}</td>
                    <td className="text-right">{formatCurrency(item.valor_total_item)}</td>
                </tr>
            ))}
            </tbody>
        </table>
        <button className="btn btn-danger" onClick={() => onOpenDeleteModal(nota)}>Excluir Nota Fiscal</button>
    </div>
);

const SearchByDate = ({ dataInicio, setDataInicio, dataFim, setDataFim, onSubmit, isLoading, msg }) => (
    <>
        <h2 className="nf-card-title">Listar por Período</h2>
        <form onSubmit={onSubmit}>
            <div className="date-form-grid">
                <div className="form-group"><label htmlFor="dataInicio">Data de Início</label><input id="dataInicio" type="date" className="form-input" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} disabled={isLoading} /></div>
                <div className="form-group"><label htmlFor="dataFim">Data de Fim</label><input id="dataFim" type="date" className="form-input" value={dataFim} onChange={(e) => setDataFim(e.target.value)} disabled={isLoading} /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-full-width" disabled={isLoading}>{isLoading ? "Buscando..." : "Listar Notas"}</button>
        </form>
        {msg.text && <div className={`feedback-message ${msg.type}`}>{msg.text}</div>}
    </>
);

const InvoicesList = ({ notas, onOpenDeleteModal }) => (
    <div className="results-container">
        <table className="items-table">
            <thead><tr><th>Nº Nota</th><th>Data</th><th>Obra</th><th className="text-right">Valor</th><th className="action-col">Ação</th></tr></thead>
            <tbody>
            {notas.map((nota) => (
                <tr key={nota.id}>
                    <td>{nota.numero}</td>
                    <td>{nota.data_emissao_formatada}</td>
                    <td>{nota.obra_nome}</td>
                    <td className="text-right">{formatCurrency(nota.valor_total_nota)}</td>
                    <td className="action-col"><button className="btn" onClick={() => onOpenDeleteModal(nota)}>Excluir</button></td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

const DeleteModal = ({ isOpen, onClose, onConfirm, nota, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Confirmar Exclusão</h2>
                <p>Deseja excluir a nota fiscal nº <strong className="item-to-delete">{nota?.numero}</strong>?</p>
                <p className="delete-warning">Esta ação não pode ser desfeita.</p>
                <div className="modal-actions">
                    <button className="btn-modal cancel" onClick={onClose} disabled={isDeleting}>Cancelar</button>
                    <button className="btn-modal danger" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</button>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
//  2. COMPONENTE PRINCIPAL (CONTAINER)
// ===================================================================

export default function NotaFiscal() {
    // --- Estados ---
    const [numeroNotaConsulta, setNumeroNotaConsulta] = useState("");
    const [notaFiscalDetalhe, setNotaFiscalDetalhe] = useState(null);
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [notasFiltradas, setNotasFiltradas] = useState([]);
    const [msgConsulta, setMsgConsulta] = useState({ type: '', text: '' });
    const [msgLista, setMsgLista] = useState({ type: '', text: '' });
    const [loadingConsulta, setLoadingConsulta] = useState(false);
    const [loadingLista, setLoadingLista] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notaToDelete, setNotaToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Efeitos ---
    useEffect(() => {
        if (msgConsulta.text) { const timer = setTimeout(() => setMsgConsulta({ type: '', text: '' }), 5000); return () => clearTimeout(timer); }
    }, [msgConsulta]);
    useEffect(() => {
        if (msgLista.text) { const timer = setTimeout(() => setMsgLista({ type: '', text: '' }), 5000); return () => clearTimeout(timer); }
    }, [msgLista]);

    // --- Funções de API ---
    const buscarNotaPorNumero = async (e) => {
        e.preventDefault();
        if (!numeroNotaConsulta.trim()) return setMsgConsulta({ type: 'error', text: 'Digite o número da nota.' });
        setLoadingConsulta(true);
        setNotaFiscalDetalhe(null);
        try {
            const { data } = await api.get(`/api/notas-fiscais/numero/${numeroNotaConsulta.trim()}`);
            setNotaFiscalDetalhe(data.status ? { ...data.data, data_emissao_formatada: formatDate(data.data.data_emissao) } : null);
            setMsgConsulta({ type: data.status ? '' : 'error', text: data.status ? '' : data.message });
        } catch (err) {
            setMsgConsulta({ type: 'error', text: err.response?.data?.message || "Erro ao buscar nota." });
        } finally {
            setLoadingConsulta(false);
        }
    };

    const buscarNotasPorData = async (e) => {
        e.preventDefault();
        if (!dataInicio || !dataFim) return setMsgLista({ type: 'error', text: 'As datas são obrigatórias.' });
        setLoadingLista(true);
        setNotasFiltradas([]);
        try {
            const { data } = await api.get(`/api/notas-fiscais/por-data?data_inicio=${dataInicio}&data_fim=${dataFim}`);
            setNotasFiltradas(data.status ? data.data.map(nf => ({ ...nf, data_emissao_formatada: formatDate(nf.data_emissao) })) : []);
            setMsgLista({ type: data.data.length > 0 ? '' : 'info', text: data.data.length > 0 ? '' : data.message });
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
            const { data } = await api.delete(`/api/notas-fiscais/${notaToDelete.id}`);
            if (data.status) {
                setMsgLista({ type: 'success', text: data.message });
                if (notaFiscalDetalhe?.id === notaToDelete.id) setNotaFiscalDetalhe(null);
                setNotasFiltradas(prev => prev.filter(n => n.id !== notaToDelete.id));
            } else {
                setMsgLista({ type: 'error', text: data.message });
            }
        } catch (err) {
            setMsgLista({ type: 'error', text: err.response?.data?.message || 'Erro ao excluir.' });
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setNotaToDelete(null);
        }
    };

    const handleOpenDeleteModal = (nota) => {
        setNotaToDelete(nota);
        setIsDeleteModalOpen(true);
    };

    // --- Renderização ---
    return (
        <>
            <div className="nf-page-wrapper">
                <div className="nf-card">
                    <SearchByNumber
                        numero={numeroNotaConsulta}
                        setNumero={setNumeroNotaConsulta}
                        onSubmit={buscarNotaPorNumero}
                        isLoading={loadingConsulta}
                        msg={msgConsulta}
                    />
                    {notaFiscalDetalhe && (
                        <InvoiceDetails nota={notaFiscalDetalhe} onOpenDeleteModal={handleOpenDeleteModal} />
                    )}
                </div>
                <div className="nf-card">
                    <SearchByDate
                        dataInicio={dataInicio} setDataInicio={setDataInicio}
                        dataFim={dataFim} setDataFim={setDataFim}
                        onSubmit={buscarNotasPorData}
                        isLoading={loadingLista}
                        msg={msgLista}
                    />
                    {notasFiltradas.length > 0 && (
                        <InvoicesList notas={notasFiltradas} onOpenDeleteModal={handleOpenDeleteModal} />
                    )}
                </div>
            </div>
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteNota}
                nota={notaToDelete}
                isDeleting={isDeleting}
            />
        </>
    );
}