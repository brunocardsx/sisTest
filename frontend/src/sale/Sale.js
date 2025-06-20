import React, { useState, useEffect, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import api from '../services/api';
import './sale.css';

// ===================================================================================
//  1. CONSTANTES E COMPONENTES DE UI "BURROS" (PRESENTATIONAL COMPONENTS)
// ===================================================================================

const darkSelectStyles = {
  control: (p) => ({ ...p, backgroundColor: '#1C1D21', borderColor: '#3B3E47', minHeight: '48px', borderRadius: '8px', boxShadow: 'none', '&:hover': { borderColor: '#2DD4BF' } }),
  menu: (p) => ({ ...p, backgroundColor: '#2A2D35', border: '1px solid #3B3E47' }),
  option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? '#2DD4BF' : s.isFocused ? '#353842' : 'transparent', color: s.isSelected ? '#1C1D21' : '#F0F2F5', fontWeight: s.isSelected ? '600' : '400', '&:active': { backgroundColor: '#353842' } }),
  singleValue: (p) => ({ ...p, color: '#F0F2F5' }),
  input: (p) => ({ ...p, color: '#F0F2F5' }),
  placeholder: (p) => ({ ...p, color: '#8A91A0' }),
};

const SaleForm = ({
                    invoiceNumber, setInvoiceNumber, invoiceDate, setInvoiceDate,
                    obraOptions, selectedObra, handleObraSelect,
                    productOptions, currentProduct, handleProductSelect, handleCreateProduct,
                    addProductToInvoice, handleOpenDeleteModal,
                    isSavingInvoice, saveInvoice, selectedItems, msg,
                    setCurrentProduct, handleInputKeyDown,
                    // Refs para controle de foco
                    invoiceDateRef, obraSelectRef, productSelectRef, quantityInputRef, unitPriceInputRef
                  }) => (
    <div className="sale-card">
      <h2 className="sale-card-title">Lançamento de Nota Fiscal</h2>

      <div className="form-group">
        <label>Número da Nota Fiscal</label>
        <input type="text" className="form-input" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Digite o número da nota" />
      </div>
      <div className="form-group">
        <label>Selecione uma Obra</label>
        <Select
            ref={obraSelectRef}
            options={obraOptions}
            onChange={handleObraSelect}
            value={selectedObra}
            placeholder="Selecione..."
            styles={darkSelectStyles}
            isClearable
        />
      </div>
      <div className="form-group">
        <label>Data da Nota Fiscal</label>
        <input ref={invoiceDateRef} type="date" className="form-input" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Selecione ou Crie um Produto</label>
        <CreatableSelect
            ref={productSelectRef}
            isClearable
            options={productOptions}
            onChange={handleProductSelect}
            onCreateOption={handleCreateProduct}
            value={currentProduct}
            placeholder="Pesquise ou digite para criar..."
            formatCreateLabel={(val) => `Criar produto: "${val}"`}
            styles={darkSelectStyles}
        />
      </div>

      {currentProduct && (
          <>
            <button type="button" className="btn-delete-product" onClick={handleOpenDeleteModal}>
              Excluir produto "{currentProduct.label}"?
            </button>
            <div className="product-entry-grid">
              <div className="form-group">
                <label>Quantidade</label>
                <input ref={quantityInputRef} type="number" min="0" className="form-input" placeholder="0" onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })} value={currentProduct.quantity || ''} onKeyDown={handleInputKeyDown} />
              </div>
              <div className="form-group">
                <label>Valor Unitário (R$)</label>
                <input ref={unitPriceInputRef} type="number" min="0" step="0.01" className="form-input" placeholder="0.00" onChange={(e) => setCurrentProduct({ ...currentProduct, unitPrice: e.target.value })} value={currentProduct.unitPrice || ''} onKeyDown={handleInputKeyDown} />
              </div>
            </div>
            <button className="btn btn-primary btn-full-width" onClick={addProductToInvoice}>
              Adicionar Produto
            </button>
          </>
      )}

      {msg.show && <div className={`feedback-message ${msg.type}`}>{msg.text}</div>}

      <div style={{ marginTop: 'auto' }}>
        <button className="btn btn-success btn-full-width" onClick={saveInvoice} disabled={isSavingInvoice || selectedItems.length === 0}>
          {isSavingInvoice ? 'Salvando Nota...' : 'Salvar Nota Fiscal'}
        </button>
      </div>
    </div>
);

const InvoiceItems = ({ items, onRemoveItem, total }) => (
    <div className="sale-card items-list-card">
      <h3 className="sale-card-title">Itens da Nota</h3>
      <div className="items-table-container">
        <table className="items-table">
          <thead>
          <tr><th>Produto</th><th>Qtd.</th><th className="text-right">Vlr. Unit.</th><th className="text-right">Total</th><th></th></tr>
          </thead>
          <tbody>
          {items.length > 0 ? (
              items.map((item) => (
                  <tr key={item.value}>
                    <td>{item.label}</td>
                    <td>{item.quantity}</td>
                    <td className="text-right">R$ {Number(item.unitPrice).toFixed(2)}</td>
                    <td className="text-right">R$ {Number(item.totalValue).toFixed(2)}</td>
                    <td><button className="btn-remove" title="Remover" onClick={() => onRemoveItem(item.value)}><i className="fas fa-times"></i></button></td>
                  </tr>
              ))
          ) : (
              <tr className="empty-row"><td colSpan="5">Nenhum item adicionado.</td></tr>
          )}
          </tbody>
        </table>
      </div>
      <div className="total-summary">
        <strong>Total:</strong>
        <span>R$ {total}</span>
      </div>
    </div>
);

const CreateProductModal = ({ isOpen, onClose, onSave, newProductName, setNewProductName, isSaving }) => {
  if (!isOpen) return null;
  return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h2>Criar Novo Produto</h2>
          <div className="form-group">
            <label>Nome do Produto</label>
            <input type="text" className="form-input" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} autoFocus />
          </div>
          <div className="modal-actions">
            <button className="btn btn-modal cancel" onClick={onClose} disabled={isSaving}>Cancelar</button>
            <button className="btn btn-modal save" onClick={onSave} disabled={isSaving || !newProductName.trim()}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
  );
};

const DeleteProductModal = ({ isOpen, onClose, onConfirm, productName, isDeleting }) => {
  if (!isOpen) return null;
  return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h2>Confirmar Exclusão</h2>
          <p>Deseja excluir o produto <strong className="product-to-delete">{productName}</strong>?</p>
          <p className='delete-warning'>Esta ação não pode ser desfeita.</p>
          <div className="modal-actions">
            <button className="btn btn-modal cancel" onClick={onClose} disabled={isDeleting}>Cancelar</button>
            <button className="btn btn-modal danger" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
            </button>
          </div>
        </div>
      </div>
  );
};


export default function Sale() {
  // --- ESTADOS DO FORMULÁRIO ---
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [selectedObra, setSelectedObra] = useState(null); // CORREÇÃO: Armazena o objeto da obra
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // --- DADOS E OPÇÕES ---
  const [obraOptions, setObraOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  // --- ESTADOS DE UI (MODAIS, MENSAGENS, ETC) ---
  const [msg, setMsg] = useState({ show: false, type: '', text: '' });
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // --- REFS PARA CONTROLE DE FOCO (MELHORIA DE USABILIDADE) ---
  const obraSelectRef = useRef(null);
  const invoiceDateRef = useRef(null);
  const productSelectRef = useRef(null);
  const quantityInputRef = useRef(null);
  const unitPriceInputRef = useRef(null);


  useEffect(() => {
    fetchProducts();
    fetchObras();
  }, []);

  useEffect(() => {
    if (msg.show) {
      const timer = setTimeout(() => setMsg({ show: false, type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const showMsg = (type, text) => setMsg({ show: true, type, text });

  const resetForm = () => {
    setInvoiceNumber('');
    setInvoiceDate('');
    setSelectedObra(null); // CORREÇÃO: Limpa o objeto da obra
    setSelectedItems([]);
    setCurrentProduct(null);
  };

  const calculateTotal = () => selectedItems.reduce((acc, item) => acc + item.totalValue, 0).toFixed(2);

  async function fetchProducts() {
    try {
      const { data } = await api.get('/api/produto');
      if (data.status && data.produtos) {
        const products = data.produtos.map((p) => ({ value: p.id, label: p.nome, ...p }));
        setProductOptions(products);
        return products;
      }
    } catch (error) { showMsg('error', 'Falha ao buscar produtos.'); }
    return [];
  }

  async function fetchObras() {
    try {
      const { data } = await api.get('/api/obras');
      if (data.status && data.obras) {
        setObraOptions(data.obras.map((o) => ({ value: o.id, label: o.nome })));
      }
    } catch (error) { showMsg('error', 'Falha ao buscar obras.'); }
  }

  const handleSaveNewProduct = async () => {
    if (!newProductName.trim()) return;
    setIsSavingProduct(true);
    try {
      const response = await api.post('/api/produto', { nome: newProductName.trim() });
      if (response.data?.status) {
        showMsg('success', `Produto "${newProductName}" criado!`);
        setIsCreateModalOpen(false);
        setNewProductName('');
        const updatedProducts = await fetchProducts();
        const newProduct = updatedProducts.find(p => p.id === response.data.produto.id);
        if (newProduct) handleProductSelect(newProduct);
      } else { showMsg('error', response.data.message || 'Erro ao criar produto.'); }
    } catch (error) { showMsg('error', error.response?.data?.message || 'Erro de conexão.'); }
    finally { setIsSavingProduct(false); }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    setIsDeletingProduct(true);
    try {
      const response = await api.delete(`/api/produto/${currentProduct.value}`);
      if (response.data?.status) {
        showMsg('success', `Produto "${currentProduct.label}" excluído.`);
        setIsDeleteModalOpen(false);
        setCurrentProduct(null);
        fetchProducts();
      } else { showMsg('error', response.data.message || 'Erro ao excluir.'); }
    } catch (error) { showMsg('error', error.response?.data?.message || 'Erro de conexão.'); }
    finally { setIsDeletingProduct(false); }
  };

  async function saveInvoice() {
    // CORREÇÃO: Valida o objeto 'selectedObra'
    if (!invoiceNumber.trim() || !selectedObra || !invoiceDate || selectedItems.length === 0) {
      return showMsg('error', 'Preencha todos os campos e adicione itens à nota.');
    }
    setIsSavingInvoice(true);
    const invoicePayload = {
      numero: invoiceNumber.trim(),
      data_emissao: invoiceDate,
      obra_id: selectedObra.value, // CORREÇÃO: Pega o ID do objeto
      itens: selectedItems.map(item => ({
        produto_id: item.value,
        quantidade: item.quantity,
        valor_unitario: item.unitPrice,
      }))
    };
    try {
      const response = await api.post('/api/notas-fiscais', invoicePayload);
      if (response.data?.status) {
        showMsg('success', 'Nota fiscal salva com sucesso!');
        resetForm();
      } else { showMsg('error', response.data.message || 'Erro ao salvar a nota.'); }
    } catch (error) { showMsg('error', error.response?.data?.message || 'Erro de conexão com o servidor.'); }
    finally { setIsSavingInvoice(false); }
  }

  // --- HANDLERS COM MELHORIAS DE USABILIDADE ---

  const handleObraSelect = (option) => {
    setSelectedObra(option);
    if (option) {
      // Move o foco para o campo de data para um fluxo mais rápido
      invoiceDateRef.current?.focus();
    }
  };

  const handleProductSelect = (option) => {
    if (option) {
      setCurrentProduct({ ...option, quantity: '', unitPrice: '' });
      // Foco no campo de quantidade após a seleção do produto
      setTimeout(() => quantityInputRef.current?.focus(), 100);
    } else {
      setCurrentProduct(null);
    }
  };

  const addProductToInvoice = () => {
    if (!currentProduct || !currentProduct.quantity || !currentProduct.unitPrice) {
      return showMsg('error', 'Preencha a quantidade e o valor do produto.');
    }
    const totalValue = Number(currentProduct.quantity) * Number(currentProduct.unitPrice);
    setSelectedItems((prev) => [...prev, { ...currentProduct, quantity: Number(currentProduct.quantity), unitPrice: Number(currentProduct.unitPrice), totalValue }]);
    setCurrentProduct(null);
    // Move o foco de volta para a seleção de produto para adicionar o próximo item
    productSelectRef.current?.focus();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addProductToInvoice();
    }
  };

  return (
      <>
        <div className="sale-page-wrapper">
          <SaleForm
              invoiceNumber={invoiceNumber} setInvoiceNumber={setInvoiceNumber}
              invoiceDate={invoiceDate} setInvoiceDate={setInvoiceDate}
              obraOptions={obraOptions} selectedObra={selectedObra} handleObraSelect={handleObraSelect}
              productOptions={productOptions} currentProduct={currentProduct} setCurrentProduct={setCurrentProduct}
              handleProductSelect={handleProductSelect} handleCreateProduct={(val) => { setNewProductName(val); setIsCreateModalOpen(true); }}
              addProductToInvoice={addProductToInvoice} handleOpenDeleteModal={() => setIsDeleteModalOpen(true)}
              isSavingInvoice={isSavingInvoice} saveInvoice={saveInvoice}
              selectedItems={selectedItems} msg={msg}
              handleInputKeyDown={handleInputKeyDown}
              // Passando os refs para o componente de formulário
              obraSelectRef={obraSelectRef}
              invoiceDateRef={invoiceDateRef}
              productSelectRef={productSelectRef}
              quantityInputRef={quantityInputRef}
              unitPriceInputRef={unitPriceInputRef}
          />
          <InvoiceItems
              items={selectedItems}
              onRemoveItem={(id) => setSelectedItems((prev) => prev.filter((item) => item.value !== id))}
              total={calculateTotal()}
          />
        </div>

        <CreateProductModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleSaveNewProduct}
            newProductName={newProductName}
            setNewProductName={setNewProductName}
            isSaving={isSavingProduct}
        />

        <DeleteProductModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteProduct}
            productName={currentProduct?.label || ''}
            isDeleting={isDeletingProduct}
        />
      </>
  );
}