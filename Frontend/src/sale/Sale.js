import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../services/api';
import './sale.css';

export default function Sale() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [productOptions, setProductOptions] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [msg, setMsg] = useState([false, '']);
  const [obraId, setObraId] = useState(null); // Estado para armazenar o ID da obra selecionada
  const [obraOptions, setObraOptions] = useState([]); // Estado para armazenar as obras disponíveis

  useEffect(() => {
    fetchProducts();
    fetchObras(); // Carregar as obras disponíveis
  }, []);

  useEffect(() => {
    if (msg[1].length !== 0) {
      const timeout = setTimeout(() => {
        setMsg([false, '']);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [msg]);

  async function fetchProducts() {
    try {
      const { data } = await api.get('/api/produto'); // Alterado para '/api/produto'
      if (!data.status) return alert('Erro ao buscar produtos.');
      const products = data.produtos.map((product) => ({
        value: product.id,
        label: product.nome,
        ...product,
      }));
      setProductOptions(products);
    } catch (error) {
      console.error(error);
      alert('Erro interno ao buscar produtos.');
    }
  }

  // Função para carregar as obras disponíveis
  async function fetchObras() {
    try {
      const { data } = await api.get('/api/obras'); // Alterado para '/api/obras' para pegar a lista de obras
      if (!data.status) return alert('Erro ao buscar obras.');
      const obras = data.obras.map((obra) => ({
        value: obra.id,
        label: obra.nome,
      }));
      setObraOptions(obras);
    } catch (error) {
      console.error(error);
      alert('Erro interno ao buscar obras.');
    }
  }

  function handleProductSelect(option) {
    setCurrentProduct({ ...option, quantity: '', unitPrice: '' });
  }

  function handleObraSelect(option) {
    setObraId(option ? option.value : null); // Atualiza o ID da obra selecionada
  }

  function addProductToInvoice(quantity, unitPrice) {
    if (!currentProduct || !quantity || !unitPrice) {
      setMsg([false, 'Preencha todos os campos antes de adicionar.']);
      return;
    }

    const totalValue = Number(quantity) * Number(unitPrice);

    setSelectedItems((prev) => [
      ...prev,
      {
        ...currentProduct,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        totalValue: Number(totalValue),
      },
    ]);

    setCurrentProduct(null);
    setMsg([true, 'Produto adicionado com sucesso.']);
  }

  function removeProductFromInvoice(id) {
    setSelectedItems((prev) => prev.filter((item) => item.value !== id));
  }

  function calculateTotal() {
    return selectedItems.reduce((acc, item) => acc + item.totalValue, 0).toFixed(2);
  }

  async function saveInvoice() {
    if (!invoiceNumber) {
      setMsg([false, 'Digite o número da nota fiscal.']);
      return;
    }

    if (!obraId) {
      setMsg([false, 'Selecione uma obra.']);
      return;
    }

    if (selectedItems.length === 0) {
      setMsg([false, 'Adicione pelo menos um produto.']);
      return;
    }

    try {
      // Payload com os dados para enviar ao backend
      const payload = {
        numero: invoiceNumber,
        obra_id: obraId,
        itens: selectedItems.map(item => ({
          produto_id: item.value,  // ID do produto
          quantidade: item.quantity, // Quantidade do produto
          valor_unitario: item.unitPrice, // Preço unitário do produto
          valor_total: item.totalValue // Total (quantidade * valor unitário)
        }))
      };

      console.log('Payload enviado:', payload);  // Verifique o payload antes da requisição

      const { data } = await api.post('/api/notas-fiscais', payload);

      console.log('Resposta da API:', data);  // Verifique a resposta da API

      if (data.status) {
        setMsg([true, 'Nota fiscal salva com sucesso!']);
        setInvoiceNumber('');
        setSelectedItems([]);
      } else {
        setMsg([false, 'Erro ao salvar nota fiscal.']);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);  // Mostra o erro completo no console
      setMsg([false, 'Erro interno ao salvar nota fiscal.']);
    }
  }

  return (
      <div className="invoice-container">
        <div className="invoice-left">
          <div className="card">
            <h2>Lançamento de Nota Fiscal</h2>

            <div className="input-group">
              <label>Número da Nota Fiscal</label>
              <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Digite o número da nota"
              />
            </div>

            <div className="input-group">
              <label>Selecione uma Obra</label>
              <Select
                  options={obraOptions}
                  onChange={handleObraSelect}
                  value={obraId ? { value: obraId, label: obraOptions.find(option => option.value === obraId)?.label } : null}
                  placeholder="Selecione uma obra..."
              />
            </div>

            <div className="input-group">
              <label>Selecione um Produto</label>
              <Select
                  options={productOptions}
                  onChange={handleProductSelect}
                  value={currentProduct ? { value: currentProduct.id, label: currentProduct.nome } : null}
                  placeholder="Pesquise um produto..."
              />
            </div>

            {currentProduct && (
                <>
                  <div className="input-group">
                    <label>Quantidade</label>
                    <input
                        type="number"
                        min="1"
                        placeholder="Quantidade"
                        onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })}
                        value={currentProduct.quantity || ''}
                    />
                  </div>

                  <div className="input-group">
                    <label>Valor Unitário</label>
                    <input
                        type="number"
                        placeholder="Valor Unitário"
                        onChange={(e) => setCurrentProduct({ ...currentProduct, unitPrice: e.target.value })}
                        value={currentProduct.unitPrice || ''}
                    />
                  </div>

                  <button className="btn-add" onClick={() => addProductToInvoice(currentProduct.quantity, currentProduct.unitPrice)}>
                    Adicionar
                  </button>
                </>
            )}

            {msg[1] && (
                msg[0]
                    ? <div className="success-msg">{msg[1]}</div>
                    : <div className="error-msg">{msg[1]}</div>
            )}
          </div>

          <button className="btn-save" onClick={saveInvoice}>Salvar Nota Fiscal</button>
        </div>

        <div className="invoice-right">
          <div className="card">
            <table className="products-table">
              <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Valor Unitário</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
              </thead>
              <tbody>
              {selectedItems.map((item) => (
                  <tr key={item.value}>
                    <td>{item.label}</td>
                    <td>{item.quantity}</td>
                    <td>R$ {item.unitPrice.toFixed(2)}</td>
                    <td>R$ {item.totalValue.toFixed(2)}</td>
                    <td>
                      <button className="btn-remove" onClick={() => removeProductFromInvoice(item.value)}>
                        Remover
                      </button>
                    </td>
                  </tr>
              ))}
              {selectedItems.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Nenhum produto adicionado.</td>
                  </tr>
              )}
              </tbody>
            </table>
            {selectedItems.length > 0 && (
                <div className="total">
                  <strong>Total: R$ {calculateTotal()}</strong>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
