import React, { useState, useEffect } from 'react';
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
  const [isSavingInvoice, setIsSavingInvoice] = useState(false); // Estado para o botão de salvar

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

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
      }
    } catch (error) {
      showMsg('error', 'Falha ao buscar produtos.');
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
    setCurrentProduct(option ? { ...option, quantity: '', unitPrice: '' } : null);
  }
  const handleCreateProduct = (inputValue) => {
    setNewProductName(inputValue);
    setIsCreateModalOpen(true);
  };
  const handleSaveNewProduct = async () => { /* ... sua lógica aqui ... */ };
  const handleOpenDeleteModal = () => { if (currentProduct) setIsDeleteModalOpen(true); };
  const handleDeleteProduct = async () => { /* ... sua lógica aqui ... */ };

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
    setCurrentProduct(null);
  }
  function removeProductFromInvoice(id) {
    setSelectedItems((prev) => prev.filter((item) => item.value !== id));
  }
  function calculateTotal() {
    return selectedItems.reduce((acc, item) => acc + item.totalValue, 0).toFixed(2);
  }

  // ==========================================================
  // FUNÇÃO PARA SALVAR A NOTA FISCAL (IMPLEMENTADA)
  // ==========================================================
  async function saveInvoice() {
    // 1. Validação
    if (!invoiceNumber.trim()) return showMsg('error', 'O número da nota fiscal é obrigatório.');
    if (!obraId) return showMsg('error', 'Selecione uma obra.');
    if (!invoiceDate) return showMsg('error', 'A data da nota fiscal é obrigatória.');
    if (selectedItems.length === 0) return showMsg('error', 'Adicione pelo menos um item à nota.');

    setIsSavingInvoice(true);

    // 2. Formatação dos dados para a API
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
      // 3. Chamada à API
      const response = await api.post('/api/notas-fiscais', invoicePayload);

      if (response.data && response.data.status) {
        showMsg('success', 'Nota fiscal salva com sucesso!');
        resetForm(); // Limpa o formulário
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
                      <input type="number" min="0" className="sale-input" placeholder="0" onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })} value={currentProduct.quantity || ''} />
                    </div>
                    <div className="sale-form-group">
                      <label>Valor Unitário (R$)</label>
                      <input type="number" min="0" step="0.01" className="sale-input" placeholder="0.00" onChange={(e) => setCurrentProduct({ ...currentProduct, unitPrice: e.target.value })} value={currentProduct.unitPrice || ''} />
                    </div>
                  </div>
                  <button className="sale-btn sale-btn-add" onClick={addProductToInvoice}>
                    Adicionar Produto à Nota
                  </button>
                </>
            )}
            {msg.show && <div className={`feedback-message ${msg.type}`}>{msg.text}</div>}
            <button className="sale-btn sale-btn-save" onClick={saveInvoice} disabled={isSavingInvoice}>
              {isSavingInvoice ? 'Salvando...' : 'Salvar Nota Fiscal'}
            </button>
          </div>
          <div className="sale-card">
            <h3 className="sale-card-title">Itens da Nota</h3>
            <div className="sale-items-table-container">
              <table className="sale-items-table">
                <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd.</th>
                  <th>Vlr. Unit.</th>
                  <th>Vlr. Total</th>
                  <th>Ação</th>
                </tr>
                </thead>
                <tbody>
                {selectedItems.length > 0 ? (
                    selectedItems.map((item) => (
                        <tr key={item.value}>
                          <td>{item.label}</td>
                          <td>{item.quantity}</td>
                          <td>R$ {Number(item.unitPrice).toFixed(2)}</td>
                          <td>R$ {Number(item.totalValue).toFixed(2)}</td>
                          <td>
                            <button className="btn-remove-item" onClick={() => removeProductFromInvoice(item.value)}>
                              Remover
                            </button>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Nenhum item adicionado.</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
            <div className="sale-total">
              <strong>Total da Nota: R$ {calculateTotal()}</strong>
            </div>
          </div>
        </div>

        {/* Modais */}
        {isCreateModalOpen && (
            <div className="modal-overlay">{/* ... */}</div>
        )}
        {isDeleteModalOpen && currentProduct && (
            <div className="modal-overlay">{/* ... */}</div>
        )}
      </>
  );
}