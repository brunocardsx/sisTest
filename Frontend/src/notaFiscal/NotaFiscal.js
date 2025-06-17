import React, { useState } from 'react'
import api from '../services/api'
import './notaFiscal.css'

export default function NotaFiscal() {
    const [numeroNota, setNumeroNota] = useState("")
    const [notaFiscal, setNotaFiscal] = useState(null)
    const [msg, setMsg] = useState("")
    const [loading, setLoading] = useState(false)

    async function buscarNota() {
        if (!numeroNota.trim()) {
            setMsg("Digite o número da nota fiscal.")
            return
        }

        setMsg("")
        setLoading(true)

        try {
            const response = await api.get(`/notas/${numeroNota}`)
            if (response.data) {
                setNotaFiscal(response.data)
            } else {
                setMsg("Nota fiscal não encontrada.")
                setNotaFiscal(null)
            }
        } catch (err) {
            console.error(err)
            setMsg("Erro ao buscar a nota fiscal.")
        }

        setLoading(false)
    }

    return (
        <div className="w-100">
            <div className="container-form container mt-5">
                <div className="small-title text-center p-0">Consultar Nota Fiscal</div>

                <div className="one-form-input">
                    <label htmlFor="numeroNota">Número da Nota Fiscal</label>
                    <input
                        className="input-default"
                        type="text"
                        id="numeroNota"
                        placeholder="Digite o número"
                        value={numeroNota}
                        onChange={(e) => setNumeroNota(e.target.value)}
                    />
                </div>

                {msg && <div className="error-msg mt-2 text-center">{msg}</div>}

                <div className="text-center mt-3">
                    <button className="btn-blue" onClick={buscarNota} disabled={loading}>
                        {loading ? "Buscando..." : "Buscar Nota"}
                    </button>
                </div>

                {notaFiscal && (
                    <div className="nota-detalhes mt-5">
                        <h3>Nota Fiscal Nº {notaFiscal.numero}</h3>
                        <p><strong>Data de Emissão:</strong> {notaFiscal.data_emissao}</p>
                        <h4>Produtos:</h4>
                        <table className="products-table">
                            <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Valor Unitário</th>
                                <th>Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {notaFiscal.itens.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.nome}</td>
                                    <td>{item.quantidade}</td>
                                    <td>R$ {parseFloat(item.valor_unitario).toFixed(2)}</td>
                                    <td>R$ {(item.quantidade * item.valor_unitario).toFixed(2)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
