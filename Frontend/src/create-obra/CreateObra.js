import React, { useState } from 'react';
import axios from 'axios';

const CreateObra = () => {
    const [formState, setFormState] = useState({
        nome: '',
        descricao: '',
        cliente_id: '',
        data_inicio: '',
        data_fim: ''
    });

    const handleChange = (e) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8081/create-obra', { ...formState });
            if (response.data.status) {
                alert('Obra criada com sucesso!');
            } else {
                alert('Erro ao criar obra!');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao criar obra!');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="nome" value={formState.nome} onChange={handleChange} placeholder="Nome da Obra" required />
            <input type="text" name="descricao" value={formState.descricao} onChange={handleChange} placeholder="Descrição" />
            <input type="number" name="cliente_id" value={formState.cliente_id} onChange={handleChange} placeholder="ID do Cliente" required />
            <input type="date" name="data_inicio" value={formState.data_inicio} onChange={handleChange} required />
            <input type="date" name="data_fim" value={formState.data_fim} onChange={handleChange} required />
            <button type="submit">Criar Obra</button>
        </form>
    );
};

export default CreateObra;
