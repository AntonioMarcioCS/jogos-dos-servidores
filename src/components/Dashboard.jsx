// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { addUserData, getUserData, updateUserData, deleteUserData } from '../services/db';
import { logoutUser } from '../services/auth';

export default function Dashboard({ user }) {
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null); // Armazena o ID do item em edição
  const [editingText, setEditingText] = useState(''); // Armazena o texto em edição

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = async () => {
    const { items, error } = await getUserData(user.uid);
    if (!error) {
      setItems(items);
    }
  };

  // Criar novo registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const { error } = await addUserData(user.uid, text);
    if (error) {
      alert("Erro ao salvar: " + error);
    } else {
      setText('');
      loadItems();
    }
  };

  // Excluir registro
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      const { error } = await deleteUserData(id);
      if (error) {
        alert("Erro ao excluir: " + error);
      } else {
        loadItems();
      }
    }
  };

  // Iniciar o modo de edição de um item
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditingText(item.content);
  };

  // Cancelar a edição
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  // Salvar alteração do item
  const handleUpdate = async (id) => {
    if (!editingText.trim()) return;

    const { error } = await updateUserData(id, editingText);
    if (error) {
      alert("Erro ao atualizar: " + error);
    } else {
      setEditingId(null);
      setEditingText('');
      loadItems();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Painel do Usuário</h2>
      <p>Conectado como: <strong>{user.email}</strong></p>
      <button onClick={logoutUser}>Sair da conta</button>

      <hr style={{ margin: '20px 0' }} />

      <h3>Adicionar Registro</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Digite algo..." 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Salvar</button>
      </form>

      <h3>Meus Registros</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li 
            key={item.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '10px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {editingId === item.id ? (
              // Formulário de Edição Inline
              <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                <input 
                  type="text" 
                  value={editingText} 
                  onChange={(e) => setEditingText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button onClick={() => handleUpdate(item.id)}>Salvar</button>
                <button onClick={cancelEditing}>Cancelar</button>
              </div>
            ) : (
              // Exibição normal do item
              <>
                <span>{item.content}</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => startEditing(item)}>Editar</button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: 'red' }}>Excluir</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}