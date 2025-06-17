import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './cadastroObra.css'; // Importa os estilos atualizados

export default function CadastroObra() {
    const [nomeNovaObra, setNomeNovaObra] = useState('');
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // Estados para o modal de exclusão
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [obraToDelete, setObraToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Função para buscar as obras
    const fetchObras = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/obras');
            if (response.data.status) {
                setObras(response.data.obras);
            } else {
                setFeedback({ message: response.data.message || 'Erro ao buscar obras.', type: 'error' });
            }
        } catch (error) {
            setFeedback({ message: 'Erro de conexão ao buscar obras.', type: 'error' });
            console.error("Erro ao buscar obras:", error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect para buscar as obras e limpar o feedback
    useEffect(() => {
        fetchObras();
    }, []);

    useEffect(() => {
        if (feedback.message) {
            const timer = setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);


    const handleNovaObraSubmit = async (e) => {
        e.preventDefault();
        if (!nomeNovaObra.trim()) {
            setFeedback({ message: 'O nome da obra é obrigatório.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/api/obras', { nome: nomeNovaObra.trim() });
            if (data.status) {
                setFeedback({ message: 'Obra cadastrada com sucesso!', type: 'success' });
                setNomeNovaObra('');
                await fetchObras();
            } else {
                setFeedback({ message: data.message || 'Ocorreu um erro.', type: 'error' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro de conexão com o servidor.';
            setFeedback({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Abre o modal e armazena a obra a ser deletada
    const handleOpenDeleteModal = (obra) => {
        setObraToDelete(obra);
        setIsDeleteModalOpen(true);
    };

    // Fecha o modal e limpa o estado
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setObraToDelete(null);
    };

    // Função que efetivamente deleta a obra, chamada pelo modal
    const handleDeleteObra = async () => {
        if (!obraToDelete) return;

        setIsDeleting(true);
        try {
            const { data } = await api.delete(`/api/obras/${obraToDelete.id}`);
            if (data.status) {
                setFeedback({ message: data.message, type: 'success' });
                await fetchObras();
            } else {
                setFeedback({ message: data.message || 'Erro ao excluir obra.', type: 'error' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro de conexão ao excluir obra.';
            setFeedback({ message: errorMessage, type: 'error' });
        } finally {
            setIsDeleting(false);
            handleCloseDeleteModal();
        }
    };

    return (
        <>
            <div className="page-container">
                <div className="form-card">
                    <h2>Cadastrar Nova Obra</h2>
                    <form onSubmit={handleNovaObraSubmit}>
                        <div className="input-group">
                            <label htmlFor="nome-nova-obra">Nome da Obra</label>
                            <input
                                type="text"
                                id="nome-nova-obra"
                                value={nomeNovaObra}
                                onChange={(e) => setNomeNovaObra(e.target.value)}
                                placeholder="Ex: Reforma Apartamento 101"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Obra'}
                        </button>
                    </form>
                </div>

                {feedback.message && (
                    <div className={`feedback-message ${feedback.type}`}>
                        {feedback.message}
                    </div>
                )}

                <div className="obras-list-container form-card">
                    <h2>Obras Cadastradas</h2>
                    {loading && obras.length === 0 && <p className="list-feedback">Carregando obras...</p>}
                    {!loading && obras.length === 0 && <p className="list-feedback">Nenhuma obra cadastrada.</p>}
                    {obras.length > 0 && (
                        <ul className="obras-list">
                            {obras.map((obra) => (
                                <li key={obra.id} className="obra-item">
                                    <span>{obra.nome}</span>
                                    <button
                                        onClick={() => handleOpenDeleteModal(obra)}
                                        className="btn-delete"
                                        disabled={loading}
                                    >
                                        Excluir
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && obraToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirmar Exclusão</h2>
                        <p>
                            Tem certeza que deseja excluir permanentemente a obra:
                            <strong className="item-to-delete">{obraToDelete.nome}</strong>?
                        </p>
                        <p className="delete-warning">Esta ação não pode ser desfeita e pode afetar notas fiscais vinculadas a esta obra.</p>
                        <div className="modal-actions">
                            <button className="btn-modal cancel" onClick={handleCloseDeleteModal} disabled={isDeleting}>
                                Cancelar
                            </button>
                            <button className="btn-modal danger" onClick={handleDeleteObra} disabled={isDeleting}>
                                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}