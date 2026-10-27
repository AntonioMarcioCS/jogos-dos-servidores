// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/auth'; // Ajuste o caminho se necessário

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { user, error } = await loginUser(email, password);
    if (error) {
      alert("Erro ao fazer login: " + error);
    } else {
      alert("Bem-vindo, " + user.email);
    }
  };

  const handleRegister = async () => {
    const { user, error } = await registerUser(email, password);
    if (error) {
      alert("Erro ao cadastrar: " + error);
    } else {
      alert("Conta criada com sucesso para: " + user.email);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', margin: '0 auto' }}>
      <h2>Login / Cadastro</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        <button type="submit">Entrar</button>
        <button type="button" onClick={handleRegister}>Criar Conta</button>
      </form>
    </div>
  );
}