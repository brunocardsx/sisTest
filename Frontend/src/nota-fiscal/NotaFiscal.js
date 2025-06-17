import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './notaFiscal.css'; // Certifique-se que este CSS é a versão com o layout centralizado

export default function NotaFiscal() {
    // Estados
    const [numeroNotaConsulta, setNumeroNotaConsulta] = useState("");
    const [notaFiscalDetalhe, setNotaFiscalDetalhe] = useState(null);
    const [msgConsulta, setMsgConsulta] = useState({ type: '', text: '' });
    const [loadingConsulta, setLoadingConsulta] = useState(false);
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [notasFiltradas, setNotasFiltradas] = useState([]);
    const [msgLista, setMsgLista] = useState({ type: '', text: '' });
    const [loadingLista, setLoadingLista] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notaToDelete, setNotaToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Efeitos para limpar mensagens de feedback
    useEffect(() => {
        if (msgConsulta.text) {
            const timer = setTimeout(() => setMsgConsulta({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [msgConsulta]);
    useEffect(() => {
        if (msgLista.text) {
            const timer = setTimeout(() => setMsgLista({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [msgLista]);

    // Funções de formatação
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
    };
    const formatCurrency = (value) => {
        const val = parseFloat(value);
        if (isNaN(val)) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    // Funções de busca
    async function buscarNotaPorNumero(e) {
        e.preventDefault();
        if (!numeroNotaConsulta.trim()) {
            setMsgConsulta({ type: 'error', text: 'Por favor, digite o número da nota fiscal.' });
            return;
        }
        setMsgConsulta({ type: '', text: '' });
        setLoadingConsulta(true);
        setNotaFiscalDetalhe(null);

        try {
            const response = await api.get(`/api/notas-fiscais/numero/${numeroNotaConsulta.trim()}`);
            if (response.data && response.data.status) {
                setNotaFiscalDetalhe({
                    ...response.data.data,
                    data_emissao_formatada: formatDate(response.data.data.data_emissao)
                });
            } else {
                setMsgConsulta({ type: 'error', text: response.data.message || "Nota fiscal não encontrada." });
            }
        } catch (err) {
            setMsgConsulta({ type: 'error', text: err.response?.data?.message || "Erro ao buscar a nota fiscal." });
        } finally {
            setLoadingConsulta(false);
        }
    }

    async function buscarNotasPorData(e) {
        e.preventDefault(); // Previne o comportamento padrão
        if (!dataInicio || !dataFim) {
            setMsgLista({ type: 'error', text: 'As datas de início e fim são obrigatórias.' });
            setNotasFiltradas([]);
            return;
        }
        setMsgLista({ type: '', text: '' });
        setLoadingLista(true);
        setNotasFiltradas([]);

        try {
            const response = await api.get(`/api/notas-fiscais/por-data?data_inicio=${dataInicio}&data_fim=${dataFim}`);
            if (response.data && response.data.status && response.data.data.length > 0) {
                setNotasFiltradas(response.data.data.map(nf => ({
                    ...nf,
                    data_emissao_formatada: formatDate(nf.data_emissao)
                })));
            } else {
                setMsgLista({ type: 'info', text: response.data.message || "Nenhuma nota fiscal encontrada." });
            }
        } catch (err) {
            setMsgLista({ type: 'error', text: err.response?.data?.message || "Erro ao buscar notas fiscais." });
        } finally {
            setLoadingLista(false);
        }
    }

    // Funções de exclusão
    const handleOpenDeleteModal = (nota) => {
        if (!nota || typeof nota.id === 'undefined') {
            setMsgLista({ type: 'error', text: 'Erro: Não foi possível identificar a nota para exclusão.' });
            return;
        }
        setNotaToDelete(nota);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setNotaToDelete(null);
    };

    const handleDeleteNota = async () => {
        if (!notaToDelete) return;
        setIsDeleting(true);
        try {
            const { data } = await api.delete(`/api/notas-fiscais/${notaToDelete.id}`);
            if (data.status) {
                if (notaFiscalDetalhe && notaFiscalDetalhe.id === notaToDelete.id) {
                    setNotaFiscalDetalhe(null);
                }
                setNotasFiltradas(prev => prev.filter(n => n.id !== notaToDelete.id));
                setMsgLista({ type: 'success', text: data.message });
            } else {
                setMsgLista({ type: 'error', text: data.message || 'Erro ao excluir a nota.' });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro de conexão ao excluir a nota.';
            setMsgLista({ type: 'error', text: errorMsg });
        } finally {
            setIsDeleting(false);
            handleCloseDeleteModal();
        }
    };

    return (
        <>
            <div className="query-nf-page-container">
                {/* CARD DE CONSULTA POR NÚMERO */}
                <div className="query-nf-card">
                    <h2 className="query-nf-card-title">Consultar por Número</h2>
                    <div className="form-content-wrapper">
                        <form onSubmit={buscarNotaPorNumero}>
                            <div className="query-nf-form-group">
                                <label htmlFor="numeroNotaConsulta">Número da Nota Fiscal</label>
                                <input
                                    className="query-nf-input"
                                    type="text"
                                    id="numeroNotaConsulta"
                                    placeholder="Digite o número"
                                    value={numeroNotaConsulta}
                                    onChange={(e) => setNumeroNotaConsulta(e.target.value)}
                                    disabled={loadingConsulta}
                                />
                            </div>
                            <button type="submit" className="query-nf-btn" disabled={loadingConsulta}>
                                {loadingConsulta ? "Buscando..." : "Buscar Nota"}
                            </button>
                        </form>
                    </div>

                    {msgConsulta.text && (
                        <div className="form-content-wrapper">
                            <p className={`query-nf-feedback ${msgConsulta.type}`}>{msgConsulta.text}</p>
                        </div>
                    )}

                    {notaFiscalDetalhe && (
                        <div className="query-nf-result-details">
                            <div className="query-nf-result-info">
                                <p><strong>Data de Emissão:</strong> {notaFiscalDetalhe.data_emissao_formatada}</p>
                                <p><strong>Obra:</strong> {notaFiscalDetalhe.obra_nome || 'N/A'}</p>
                                <p><strong>Valor Total:</strong> {formatCurrency(notaFiscalDetalhe.valor_total_nota)}</p>
                            </div>
                            <table className="query-nf-items-table">
                                <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th className="col-quantity">Qtd</th>
                                    <th className="col-value">Vl. Unit.</th>
                                    <th className="col-total">Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {notaFiscalDetalhe.itens.length > 0 ? notaFiscalDetalhe.itens.map((item, i) => (
                                    <tr key={`detalhe-item-${i}`}>
                                        <td>{item.produto_nome}</td>
                                        <td className="col-quantity">{item.quantidade}</td>
                                        <td className="col-value">{formatCurrency(item.valor_unitario)}</td>
                                        <td className="col-total">{formatCurrency(item.valor_total_item)}</td>
                                    </tr>
                                )) : (
                                    <tr className="empty-row"><td colSpan="4">Nenhum item encontrado.</td></tr>
                                )}
                                </tbody>
                            </table>
                            <div className="form-content-wrapper">
                                <button
                                    className="query-nf-btn-delete"
                                    onClick={() => handleOpenDeleteModal(notaFiscalDetalhe)}
                                    disabled={isDeleting}
                                >
                                    Excluir Nota Fiscal
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* CARD DE LISTAGEM POR DATA */}
                <div className="query-nf-card">
                    <h2 className="query-nf-card-title">Listar por Período</h2>
                    <div className="form-content-wrapper">
                        <form onSubmit={buscarNotasPorData} className="query-nf-date-form">
                            <div className="query-nf-form-group">
                                <label htmlFor="dataInicio">Data de Início</label>
                                <input
                                    className="query-nf-input"
                                    type="date"
                                    id="dataInicio"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                    disabled={loadingLista}
                                />
                            </div>
                            <div className="query-nf-form-group">
                                <label htmlFor="dataFim">Data de Fim</label>
                                <input
                                    className="query-nf-input"
                                    type="date"
                                    id="dataFim"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                    disabled={loadingLista}
                                />
                            </div>
                        </form>
                        <button
                            type="button"
                            className="query-nf-btn"
                            style={{ marginTop: '1rem' }}
                            onClick={buscarNotasPorData}
                            disabled={loadingLista}
                        >
                            {loadingLista ? "Buscando..." : "Listar Notas"}
                        </button>
                    </div>

                    {loadingLista && <p className="query-nf-loading">Carregando notas...</p>}
                    {msgLista.text && <p className={`query-nf-feedback ${msgLista.type}`}>{msgLista.text}</p>}

                    {notasFiltradas.length > 0 && (
                        <div className="query-nf-list-results">
                            <table className="query-nf-items-table">
                                <thead>
                                <tr>
                                    <th>Nº da Nota</th>
                                    <th>Data Emissão</th>
                                    <th>Obra</th>
                                    <th>Valor Total</th>
                                    <th className="action-col">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {notasFiltradas.map((nota) => (
                                    <tr key={nota.id}>
                                        <td>{nota.numero}</td>
                                        <td>{nota.data_emissao_formatada}</td>
                                        <td>{nota.obra_nome}</td>
                                        <td>{formatCurrency(nota.valor_total_nota)}</td>
                                        <td className="action-col">
                                            <button
                                                className="query-nf-btn-delete"
                                                onClick={() => handleOpenDeleteModal(nota)}
                                                disabled={isDeleting}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && notaToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirmar Exclusão</h2>
                        <p>
                            Tem certeza que deseja excluir permanentemente a nota fiscal nº:
                            <strong className="item-to-delete">{notaToDelete.numero}</strong>?
                        </p>
                        <p className="delete-warning">Esta ação não pode ser desfeita e removerá todos os itens associados a esta nota.</p>
                        <div className="modal-actions">
                            <button className="btn-modal cancel" onClick={handleCloseDeleteModal} disabled={isDeleting}>
                                Cancelar
                            </button>
                            <button className="btn-modal danger" onClick={handleDeleteNota} disabled={isDeleting}>
                                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}