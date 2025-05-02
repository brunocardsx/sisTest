import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './home.css'


export default function Home() {
    const [dados, setDados] = useState([])

    useEffect(() => {
        // Simulação de chamada à API/backend
        setDados([
            { name: 'Jan', vendas: 120 },
            { name: 'Fev', vendas: 98 },
            { name: 'Mar', vendas: 150 },
        ])
    }, [])

    return (
        <div className="home-container">
            <h2>Bem-vindo de volta 👋</h2>

            <div className="cards-container">
                <div className="card-info">
                    <h4>Total de Vendas</h4>
                    <p>R$ 12.500</p>
                </div>
                <div className="card-info">
                    <h4>Clientes</h4>
                    <p>89</p>
                </div>
                <div className="card-info">
                    <h4>Produtos</h4>
                    <p>35</p>
                </div>
            </div>

            <div className="grafico-container">
                <h4>Vendas dos últimos meses</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dados}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="vendas" fill="#007bff" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}