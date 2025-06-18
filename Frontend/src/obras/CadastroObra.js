import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './cadastroObra.css';

// ===================================================================
//  1. COMPONENTES DE UI (PRESENTATIONAL)
// ===================================================================

const ObraForm = ({ nome, setNome, onSubmit, isLoading, feedback }) => (
    <div className="obra-card">
        <h2 className="obra-card-title">Cadastrar Nova Obra</h2>
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <label htmlFor="nome-nova-obra">Nome da Obra</label>
                <input
                    type="text"
                    id="nome-nova-obra"
                    className="form-input"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Reforma Apartamento 101"
                    disabled={isLoading}
                />
            </div>
            <button type="submit" className="btn btn-success btn-full-width" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Obra'}
            </button>
        </form>
        {feedback.message && (
            <div className={`feedback-message ${feedback.type}`}>{feedback.message}</div>
        )}
    </div>
);

const ObrasList = ({ obras, onOpenDeleteModal, isLoading }) => (
    <div className="obra-card">
        <h2 className="obra-card-title">Obras Cadastradas</h2>
        {isLoading && obras.length === 0 && <p className="list-feedback">Carregando...</p>}
        {!isLoading && obras.length === 0 && <p className="list-feedback">Nenhuma obra cadastrada.</p>}
        {obras.length > 0 && (
            <ul className="obras-list-container">
                {obras.map((obra) => (
                    <li key={obra.id} className="obra-item">
                        <span>{obra.nome}</span>
                        <button
                            onClick={() => onOpenDeleteModal(obra)}
                            className="btn btn-danger"
                            disabled={isLoading}
                        >
                            Excluir
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, obra, isDeleting }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Confirmar Exclusão</h2>
                <p>
                    Tem certeza que deseja excluir a obra: <strong className="item-to-delete">{obra?.nome}</strong>?
                </p>
                <p className="delete-warning">Esta ação não pode ser desfeita.</p>
                <div className="modal-actions">
                    <button className="btn-modal cancel" onClick={onClose} disabled={isDeleting}>
                        Cancelar
                    </button>
                    <button className="btn-modal danger" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// ===================================================================
//  2. COMPONENTE PRINCIPAL (CONTAINER)
// ===================================================================

export default function CadastroObra() {
    // --- Estados ---
    const [nomeNovaObra, setNomeNovaObra] = useState('');
    const [obras, setObras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [obraToDelete, setObraToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Funções de API ---
    const fetchObras = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/obras');
            setObras(data.status ? data.obras : []);
        } catch (error) {
            setFeedback({ message: 'Erro de conexão ao buscar obras.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // --- Efeitos ---
    useEffect(() => {
        fetchObras();
    }, []);

    useEffect(() => {
        if (feedback.message) {
            const timer = setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    // --- Manipuladores de Eventos ---
    const handleNovaObraSubmit = async (e) => {
        e.preventDefault();
        if (!nomeNovaObra.trim()) {
            return setFeedback({ message: 'O nome da obra é obrigatório.', type: 'error' });
        }
        setLoading(true);
        try {
            const { data } = await api.post('/api/obras', { nome: nomeNovaObra.trim() });
            if (data.status) {
                setFeedback({ message: 'Obra cadastrada com sucesso!', type: 'success' });
                setNomeNovaObra('');
                fetchObras(); // Re-busca a lista para incluir a nova obra
            } else {
                setFeedback({ message: data.message || 'Ocorreu um erro.', type: 'error' });
            }
        } catch (error) {
            setFeedback({ message: error.response?.data?.message || 'Erro de conexão.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteObra = async () => {
        if (!obraToDelete) return;
        setIsDeleting(true);
        try {
            const { data } = await api.delete(`/api/obras/${obraToDelete.id}`);
            if (data.status) {
                setFeedback({ message: data.message, type: 'success' });
                fetchObras(); // Re-busca a lista atualizada
            } else {
                setFeedback({ message: data.message || 'Erro ao excluir.', type: 'error' });
            }
        } catch (error) {
            setFeedback({ message: error.response?.data?.message || 'Erro de conexão.', type: 'error' });
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setObraToDelete(null);
        }
    };

    // --- Renderização ---
    return (
        <>
            <div className="obras-page-wrapper">
                <ObraForm
                    nome={nomeNovaObra}
                    setNome={setNomeNovaObra}
                    onSubmit={handleNovaObraSubmit}
                    isLoading={loading}
                    feedback={feedback}
                />
                <ObrasList
                    obras={obras}
                    onOpenDeleteModal={(obra) => { setObraToDelete(obra); setIsDeleteModalOpen(true); }}
                    isLoading={loading}
                />
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteObra}
                obra={obraToDelete}
                isDeleting={isDeleting}
            />
        </>
    );
}