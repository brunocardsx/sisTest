import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function Dashboard() {
  const [dados, setDados] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState('todos');
  const [obras, setObras] = useState([]); // Para armazenar as obras disponíveis
  const [obraSelecionada, setObraSelecionada] = useState(null); // Para armazenar a obra selecionada

  useEffect(() => {
    fetchObras();
    fetchMonthlyInvoices();
  }, [obraSelecionada, mesSelecionado]); // Agora, os dados serão recarregados sempre que a obra ou o mês mudarem

  const fetchObras = async () => {
    try {
      const { data } = await api.get('/api/obras/obras'); // Supondo que você tenha um endpoint para buscar obras
      if (data.status) {
        setObras(data.obras);
      } else {
        alert("Erro ao buscar obras.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar obras.");
    }
  };

  const fetchMonthlyInvoices = async () => {
    if (!obraSelecionada) {
      return; // Se nenhuma obra estiver selecionada, não faz sentido buscar as notas fiscais
    }

    try {
      const { data } = await api.get(`/notas-fiscais/${obraSelecionada}/mensal`, { params: { mes: mesSelecionado } });
      if (data.status) {
        setDados(data.data);
      } else {
        alert("Erro ao buscar dados do gráfico.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar dados do gráfico.");
    }
  };

  const handleObraChange = (event) => {
    setObraSelecionada(event.target.value);
  };

  const corPorMes = {
    Jan: '#FF6384',
    Fev: '#36A2EB',
    Mar: '#FFCE56',
    Abr: '#4BC0C0',
    Mai: '#9966FF',
    Jun: '#F08080',
    Jul: '#8FBC8F',
    Ago: '#DA70D6',
    Set: '#FFA07A',
    Out: '#20B2AA',
    Nov: '#778899',
    Dez: '#D2691E'
  };

  // Filtrando os dados de acordo com o mês selecionado
  const dadosFiltrados = mesSelecionado === 'todos'
      ? dados
      : dados.filter(item => item.mes.startsWith(mesSelecionado));

  const totalVendas = dadosFiltrados.reduce((acc, item) => acc + item.total_compras, 0);

  const data = {
    labels: dadosFiltrados.map(item => item.mes),
    datasets: [
      {
        label: 'Compras no mês',
        data: dadosFiltrados.map(item => item.total_compras),
        backgroundColor: dadosFiltrados.map(item => corPorMes[item.mes.split('/')[0]]),
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#4e73df',
          font: {
            size: 14,
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 8,
        },
        formatter: (value) => {
          return `R$ ${value.toFixed(2).replace('.', ',')}`;
        },
        anchor: 'center',
        align: 'center',
      }
    }
  };

  return (
      <div className="w-100">
        <div className="dashboard-content">
          <h1 className="big-title">Sistema de Gestão</h1>

          <div className="cards-dashboard">
            <div className="dashboard-card-center">
              <Link to="/select-action" className="no-href-decoration href-dashboard-card">
                <div className="card-dashboard">Cadastrar Gasto <i className="fas fa-hand-holding-usd"></i></div>
              </Link>
            </div>

            <div className="dashboard-card-center">
              <Link to="/cliente" className="no-href-decoration href-dashboard-card">
                <div className="card-dashboard">Cliente <i className="fas fa-users"></i></div>
              </Link>
            </div>

            <div className="dashboard-card-center">
              <Link to="/produto" className="no-href-decoration href-dashboard-card">
                <div className="card-dashboard">Produto <i className="fas fa-store"></i></div>
              </Link>
            </div>

            <div className="dashboard-card-center">
              <Link to="/produto" className="no-href-decoration href-dashboard-card" style={{ marginTop: "20%" }}>
                <div className="card-dashboard">Contas <i className="fas fa-minus-circle"></i></div>
              </Link>
            </div>

            <div className="dashboard-card-center">
              <Link to="/estoque" className="no-href-decoration href-dashboard-card" style={{ marginTop: "20%" }}>
                <div className="card-dashboard">Estoque <i className="fas fa-boxes"></i></div>
              </Link>
            </div>
          </div>

          <div className="grafico-container">
            <h4>Distribuição de Compras por Mês</h4>

            {/* Seleção da obra */}
            <div className="select-obra-container">
              <label>Selecione a Obra</label>
              <select
                  value={obraSelecionada}
                  onChange={handleObraChange}
                  className="select-obra"
              >
                <option value="">Selecione uma obra</option>
                {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.nome}
                    </option>
                ))}
              </select>
            </div>

            {/* Seleção do mês */}
            <select
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
                className="select-mes"
            >
              <option value="todos">Todos os meses</option>
              {dados.map(item => (
                  <option key={item.mes} value={item.mes.split('/')[0]}>
                    {item.mes}
                  </option>
              ))}
            </select>

            <div className="grafico-total-container">
              <div className="chart-wrapper" style={{ height: '400px' }}>
                <Pie data={data} options={options} />
              </div>

              <div className="total-vendas">
                <h3>Total dos Gastos</h3>
                <p>R$ {totalVendas.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
