import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function Dashboard() {
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState('todos');
  const [obras, setObras] = useState([]);
  const [obraSelecionada, setObraSelecionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchObras();
  }, []);

  useEffect(() => {
    if (obraSelecionada) {
      fetchMonthlyInvoices();
    } else {
      setDadosGrafico([]);
    }
  }, [obraSelecionada]);

  const fetchObras = async () => {
    try {
      setErrorMsg('');
      const { data } = await api.get('/api/obras');
      if (data.status) {
        setObras(data.obras);
      } else {
        setErrorMsg("Erro ao buscar obras: " + (data.message || ''));
      }
    } catch (error) {
      console.error("Erro API Obras:", error);
      setErrorMsg("Falha ao conectar com o servidor para buscar obras.");
    }
  };

  const fetchMonthlyInvoices = async () => {
    if (!obraSelecionada) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const url = `/api/notas-fiscais/mensal/${obraSelecionada}`;
      const { data } = await api.get(url);

      if (data.status && Array.isArray(data.data)) {
        const dadosCorrigidos = data.data.map(item => ({
          ...item,
          total_compras: parseFloat(item.total_compras) || 0
        }));
        setDadosGrafico(dadosCorrigidos);
        if (dadosCorrigidos.length === 0) {
          setErrorMsg("Nenhum dado de compra encontrado para esta obra.");
        }
      } else {
        console.warn("Dados não retornados ou formato inesperado:", data);
        setDadosGrafico([]);
        setErrorMsg(data.message || "Nenhum dado retornado para a obra selecionada.");
      }
    } catch (error) {
      console.error("Erro API Notas:", error);
      setDadosGrafico([]);
      setErrorMsg(error.response?.data?.message || "Falha ao buscar dados de compras.");
    } finally {
      setLoading(false);
    }
  };

  const handleObraChange = (event) => {
    setObraSelecionada(event.target.value);
    setMesSelecionado('todos');
    setErrorMsg('');
  };

  const handleMesChange = (event) => {
    setMesSelecionado(event.target.value);
  };

  const coresGrafico = [
    '#4A90E2', '#F5A623', '#50E3C2', '#BD10E0', '#7ED321',
    '#E350A2', '#23C9F5', '#F8E71C', '#E06110', '#2178D3',
    '#D0021B', '#417505'
  ];

  const dadosFiltrados = mesSelecionado === 'todos'
      ? dadosGrafico
      : dadosGrafico.filter(item => item.mes === mesSelecionado);

  const totalGastos = dadosFiltrados.reduce((acc, item) => acc + item.total_compras, 0);

  const dataGraficoPizza = {
    labels: dadosFiltrados.map(item => item.mes),
    datasets: [
      {
        label: 'Gastos no Mês',
        data: dadosFiltrados.map(item => item.total_compras),
        backgroundColor: dadosFiltrados.map((item, index) => coresGrafico[index % coresGrafico.length]),
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 8
      }
    ]
  };

  const optionsGraficoPizza = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#4B5563',
          font: { size: 13, family: "'Inter', sans-serif" },
          padding: 25,
          usePointStyle: true,
          pointStyle: 'rectRounded'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 14, family: "'Inter', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        padding: 10,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
            }
            return label;
          }
        }
      },
      datalabels: {
        color: '#FFFFFF',
        font: {
          weight: 'bold',
          size: 13,
          family: "'Inter', sans-serif"
        },
        formatter: (value) => {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
        },
        anchor: 'center',
        align: 'center',
        display: function(context) {
          return (context.dataset.data[context.dataIndex] / totalGastos) > 0.05;
        }
      }
    }
  };

  const mesesDisponiveis = [...new Set(dadosGrafico.map(item => item.mes))];

  // ================== ALTERAÇÃO PRINCIPAL AQUI ==================
  // Definição dos cards de navegação, com "Produto" e "Estoque" removidos.
  const navCards = [
    { to: "/select-action/venda", label: "Cadastrar Gasto", icon: "fas fa-plus-circle" },
    { to: "/obras", label: "Obras", icon: "fas fa-hard-hat" },
    { to: "/notaFiscal", label: "Nota Fiscal", icon: "fas fa-file-invoice-dollar" },
  ];
  // ===============================================================

  return (
      <div className="dashboard-container-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Sistema de Gestão</h1>
        </div>

        <div className="dashboard-content-wrapper">
          <div className="dashboard-cards-grid">
            {navCards.map(card => (
                <Link to={card.to} className="dashboard-nav-card-link" key={card.label}>
                  <div className="dashboard-nav-card">
                    <i className={card.icon}></i>
                    <span>{card.label}</span>
                  </div>
                </Link>
            ))}
          </div>

          <div className="dashboard-chart-section">
            <h2 className="section-title">Distribuição de Compras por Mês</h2>

            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="obra-select">Obra:</label>
                <select id="obra-select" className="dashboard-select" value={obraSelecionada} onChange={handleObraChange}>
                  <option value="">Selecione uma obra</option>
                  {obras.map((obra) => (
                      <option key={obra.id} value={obra.id}>{obra.nome}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="mes-select">Mês:</label>
                <select id="mes-select" className="dashboard-select" value={mesSelecionado} onChange={handleMesChange} disabled={!obraSelecionada || loading || mesesDisponiveis.length === 0}>
                  <option value="todos">Todos os meses</option>
                  {mesesDisponiveis.map(mes => (
                      <option key={mes} value={mes}>{mes}</option>
                  ))}
                </select>
              </div>
            </div>

            {errorMsg && <p className="dashboard-error-message">{errorMsg}</p>}

            <div className="chart-and-total-container">
              <div className="chart-wrapper-dashboard">
                {loading ? (
                    <p className="loading-text">Carregando dados do gráfico...</p>
                ) : dadosGrafico.length > 0 && dadosFiltrados.length > 0 ? (
                    <Pie data={dataGraficoPizza} options={optionsGraficoPizza} />
                ) : !loading && obraSelecionada && !errorMsg ? (
                    <p className="no-data-text">Nenhum dado de compra para exibir.</p>
                ) : !loading && !obraSelecionada ? (
                    <p className="no-data-text">Selecione uma obra para visualizar os gastos.</p>
                ) : null}
              </div>

              {dadosGrafico.length > 0 && dadosFiltrados.length > 0 && !loading && (
                  <div className="total-gastos-card">
                    <h3>Total dos Gastos</h3>
                    <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGastos)}</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}