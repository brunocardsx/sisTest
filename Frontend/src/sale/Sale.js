import React, { useState, useEffect, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import api from '../services/api';
import './sale.css';

// Estilos customizados (inalterado)
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided, minHeight: '42px', border: state.isFocused ? '1px solid #2563EB' : '1px solid #D1D5DB', borderRadius: '6px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#2563EB' : '#9CA3AF' },
  }),
  option: (provided, state) => ({
    ...provided, backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#DBEAFE' : 'white',
    color: state.isSelected ? 'white' : '#111827',
  }),
  placeholder: (provided) => ({ ...provided, color: '#9CA3AF' }),
};

export default function Sale() {
  // Estados
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [productOptions, setProductOptions] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [msg, setMsg] = useState({ show: false, type: '', text: '' });
  const [obraId, setObraId] = useState(null);
  const [obraOptions, setObraOptions] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Refs para focar nos inputs
  const quantityInputRef = useRef(null);

  // Hooks
  useEffect(() => {
    fetchProducts();
    fetchObras();
  }, []);

  useEffect(() => {
    if (msg.show) {
      const timeout = setTimeout(() => setMsg({ show: false, type: '', text: '' }), 4000);
      return () => clearTimeout(timeout);
    }
  }, [msg]);

  // Funções auxiliares
  const showMsg = (type, text) => setMsg({ show: true, type, text });

  const resetForm = () => {
    setInvoiceNumber('');
    setInvoiceDate('');
    setObraId(null);
    setSelectedItems([]);
    setCurrentProduct(null);
  };

  // Funções de busca
  async function fetchProducts() {
    try {
      const { data } = await api.get('/api/produto');
      if (data.status && data.produtos) {
        const products = data.produtos.map((p) => ({ value: p.id, label: p.nome, ...p }));
        setProductOptions(products);
        return products;
      }
      return [];
    } catch (error) {
      showMsg('error', 'Falha ao buscar produtos.');
      return [];
    }
  }
  async function fetchObras() {
    try {
      const { data } = await api.get('/api/obras');
      if (data.status && data.obras) {
        const obras = data.obras.map((o) => ({ value: o.id, label: o.nome }));
        setObraOptions(obras);
      }
    } catch (error) {
      showMsg('error', 'Falha ao buscar obras.');
    }
  }

  // Funções de manipulação de produtos
  function handleProductSelect(option) {
    if (option) {
      setCurrentProduct({ ...option, quantity: '', unitPrice: '' });
      setTimeout(() => quantityInputRef.current?.focus(), 100);
    } else {
      setCurrentProduct(null);
    }
  }
  const handleCreateProduct = (inputValue) => {
    setNewProductName(inputValue);
    setIsCreateModalOpen(true);
  };

  // <<< CORREÇÃO: Lógica para salvar o novo produto implementada.
  const handleSaveNewProduct = async () => {
    if (!newProductName.trim()) {
      showMsg('error', 'O nome do produto não pode ser vazio.');
      return;
    }
    setIsSavingProduct(true);
    try {
      const response = await api.post('/api/produto', { nome: newProductName.trim() });
      if (response.data && response.data.status) {
        showMsg('success', `Produto "${newProductName}" criado com sucesso!`);
        setIsCreateModalOpen(false);
        setNewProductName('');
        const updatedProducts = await fetchProducts(); // Recarrega a lista
        const newProduct = updatedProducts.find(p => p.id === response.data.produto.id);
        if (newProduct) {
          handleProductSelect(newProduct); // Seleciona o produto recém-criado
        }
      } else {
        showMsg('error', response.data.message || 'Erro ao criar produto.');
      }
    } catch (error) {
      showMsg('error', error.response?.data?.message || 'Erro de conexão.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleOpenDeleteModal = () => { if (currentProduct) setIsDeleteModalOpen(true); };

  // <<< CORREÇÃO: Lógica para deletar o produto implementada.
  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    setIsDeletingProduct(true);
    try {
      const response = await api.delete(`/api/produto/${currentProduct.value}`);
      if (response.data && response.data.status) {
        showMsg('success', `Produto "${currentProduct.label}" excluído com sucesso.`);
        setIsDeleteModalOpen(false);
        setCurrentProduct(null);
        fetchProducts(); // Recarrega a lista de produtos
      } else {
        showMsg('error', response.data.message || 'Erro ao excluir o produto.');
      }
    } catch (error) {
      showMsg('error', error.response?.data?.message || 'Erro de conexão.');
    } finally {
      setIsDeletingProduct(false);
    }
  };


  // Funções de manipulação da nota
  function handleObraSelect(option) {
    setObraId(option ? option.value : null);
  }
  function addProductToInvoice() {
    if (!currentProduct || !currentProduct.quantity || !currentProduct.unitPrice) {
      return showMsg('error', 'Preencha a quantidade e o valor do produto.');
    }
    const totalValue = Number(currentProduct.quantity) * Number(currentProduct.unitPrice);
    setSelectedItems((prev) => [...prev, { ...currentProduct, quantity: Number(currentProduct.quantity), unitPrice: Number(currentProduct.unitPrice), totalValue }]);
    setCurrentProduct(null); // Limpa a seleção para adicionar o próximo
  }
  function removeProductFromInvoice(id) {
    setSelectedItems((prev) => prev.filter((item) => item.value !== id));
  }
  function calculateTotal() {
    return selectedItems.reduce((acc, item) => acc + item.totalValue, 0).toFixed(2);
  }

  // Função para adicionar produto com a tecla "Enter"
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addProductToInvoice();
    }
  };

  // ==========================================================
  // FUNÇÃO PARA SALVAR A NOTA FISCAL (Sua implementação original mantida)
  // ==========================================================
  async function saveInvoice() {
    if (!invoiceNumber.trim()) return showMsg('error', 'O número da nota fiscal é obrigatório.');
    if (!obraId) return showMsg('error', 'Selecione uma obra.');
    if (!invoiceDate) return showMsg('error', 'A data da nota fiscal é obrigatória.');
    if (selectedItems.length === 0) return showMsg('error', 'Adicione pelo menos um item à nota.');

    setIsSavingInvoice(true);
    const invoicePayload = {
      numero: invoiceNumber.trim(),
      data_emissao: invoiceDate,
      obra_id: obraId,
      itens: selectedItems.map(item => ({
        produto_id: item.value,
        quantidade: item.quantity,
        valor_unitario: item.unitPrice,
      }))
    };
    try {
      const response = await api.post('/api/notas-fiscais', invoicePayload);
      if (response.data && response.data.status) {
        showMsg('success', 'Nota fiscal salva com sucesso!');
        resetForm();
      } else {
        showMsg('error', response.data.message || 'Erro ao salvar a nota.');
      }
    } catch (error) {
      console.error("Erro ao salvar nota:", error.response || error);
      showMsg('error', error.response?.data?.message || 'Erro de conexão com o servidor.');
    } finally {
      setIsSavingInvoice(false);
    }
  }

  return (
      <>
        <div className="sale-page-container">
          <div className="sale-card">
            <h2 className="sale-card-title">Lançamento de Nota Fiscal</h2>
            <div className="sale-form-group">
              <label>Número da Nota Fiscal</label>
              <input type="text" className="sale-input" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Digite o número da nota" />
            </div>
            <div className="sale-form-group">
              <label>Selecione uma Obra</label>
              <Select options={obraOptions} onChange={handleObraSelect} value={obraOptions.find(o => o.value === obraId) || null} placeholder="Selecione uma obra..." styles={customSelectStyles} isClearable />
            </div>
            <div className="sale-form-group">
              <label>Data da Nota Fiscal</label>
              <input type="date" className="sale-input" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div className="sale-form-group">
              <label>Selecione ou Crie um Produto</label>
              <CreatableSelect isClearable options={productOptions} onChange={handleProductSelect} onCreateOption={handleCreateProduct} value={currentProduct} placeholder="Pesquise ou digite para criar..." formatCreateLabel={(inputValue) => `Criar produto: "${inputValue}"`} styles={customSelectStyles} />
            </div>
            {currentProduct && (
                <>
                  <button type="button" className="sale-btn-delete-product" onClick={handleOpenDeleteModal}>
                    <i className="fas fa-trash-alt" style={{ marginRight: '8px' }}></i> Excluir produto "{currentProduct.label}"
                  </button>
                  <div className="sale-product-details">
                    <div className="sale-form-group">
                      <label>Quantidade</label>
                      <input ref={quantityInputRef} type="number" min="0" className="sale-input" placeholder="0" onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })} value={currentProduct.quantity || ''} onKeyDown={handleInputKeyDown} />
                    </div>
                    <div className="sale-form-group">
                      <label>Valor Unitário (R$)</label>
                      <input type="number" min="0" step="0.01" className="sale-input" placeholder="0.00" onChange={(e) => setCurrentProduct({ ...currentProduct, unitPrice: e.target.value })} value={currentProduct.unitPrice || ''} onKeyDown={handleInputKeyDown} />
                    </div>
                  </div>
                  <button className="sale-btn sale-btn-add" onClick={addProductToInvoice}>
                    Adicionar Produto à Nota
                  </button>
                </>
            )}
            {msg.show && <div className={`feedback-message ${msg.type}`}>{msg.text}</div>}
            <button className="sale-btn sale-btn-save" onClick={saveInvoice} disabled={isSavingInvoice || selectedItems.length === 0}>
              {isSavingInvoice ? 'Salvando...' : 'Salvar Nota Fiscal'}
            </button>
          </div>
          <div className="sale-card">
            {/* ... (O restante do card de itens da nota permanece o mesmo) ... */}
          </div>
        </div>

        {/* <<< CORREÇÃO: JSX completo para o modal de criação. */}
        {isCreateModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 className="modal-title">Criar Novo Produto</h3>
                <p>Digite o nome do novo produto que deseja cadastrar.</p>
                <div className="sale-form-group">
                  <label>Nome do Produto</label>
                  <input
                      type="text"
                      className="sale-input"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button className="modal-btn modal-btn-cancel" onClick={() => setIsCreateModalOpen(false)} disabled={isSavingProduct}>
                    Cancelar
                  </button>
                  <button className="modal-btn modal-btn-confirm" onClick={handleSaveNewProduct} disabled={isSavingProduct}>
                    {isSavingProduct ? 'Salvando...' : 'Salvar Produto'}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* <<< CORREÇÃO: JSX completo para o modal de exclusão. */}
        {isDeleteModalOpen && currentProduct && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 className="modal-title">Confirmar Exclusão</h3>
                <p>Você tem certeza que deseja excluir o produto <strong>"{currentProduct.label}"</strong>? Esta ação não pode ser desfeita.</p>
                <div className="modal-actions">
                  <button className="modal-btn modal-btn-cancel" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeletingProduct}>
                    Cancelar
                  </button>
                  <button className="modal-btn modal-btn-danger" onClick={handleDeleteProduct} disabled={isDeletingProduct}>
                    {isDeletingProduct ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );
}