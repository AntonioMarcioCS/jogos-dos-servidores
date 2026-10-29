import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  subscribeDelegacoes,
  addDelegacao,
  updateDelegacao,
  deleteDelegacao,
  subscribeModalidades,
  addModalidade,
  updateModalidade,
  deleteModalidade,
  subscribeJogos,
  addJogo,
  updateJogo,
  deleteJogo,
  subscribePremiacoes,
  salvarPremiacao,
  deletePremiacao,
} from "../services/db";

export const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("delegacoes");
  const [delegacoes, setDelegacoes] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [premiacoes, setPremiacoes] = useState([]);

  // Estados dos Formulários
  const [delForm, setDelForm] = useState({ id: null, nome: "", sigla: "", logoUrl: "" });
  const [modForm, setModForm] = useState({ id: null, nome: "", genero: "M", faixaEtaria: "Livre", formato: "1v1" });
  const [jogoForm, setJogoForm] = useState({
    id: null, modalidadeId: "", dataHora: "", local: "", status: "agendado",
    delegacao1Id: "", delegacao2Id: "", placar1: "0", placar2: "0", descricaoGrupo: ""
  });
  const [premForm, setPremForm] = useState({ id: null, modalidadeId: "", ouroDelegacaoId: "", prataDelegacaoId: "", bronzeDelegacaoId: "" });

  useEffect(() => {
    const unsubDel = subscribeDelegacoes(setDelegacoes);
    const unsubMod = subscribeModalidades(setModalidades);
    const unsubJog = subscribeJogos(setJogos);
    const unsubPrem = subscribePremiacoes(setPremiacoes);

    return () => {
      unsubDel();
      unsubMod();
      unsubJog();
      unsubPrem();
    };
  }, []);

  // Handlers Delegações
  const handleSaveDelegacao = async (e) => {
    e.preventDefault();
    if (!delForm.nome || !delForm.sigla) return;
    const { id, ...payload } = delForm;
    payload.sigla = payload.sigla.toUpperCase();
    id ? await updateDelegacao(id, payload) : await addDelegacao(payload);
    setDelForm({ id: null, nome: "", sigla: "", logoUrl: "" });
  };

  // Handlers Modalidades
  const handleSaveModalidade = async (e) => {
    e.preventDefault();
    if (!modForm.nome) return;
    const { id, ...payload } = modForm;
    id ? await updateModalidade(id, payload) : await addModalidade(payload);
    setModForm({ id: null, nome: "", genero: "M", faixaEtaria: "Livre", formato: "1v1" });
  };

  // Handlers Jogos
  const handleSaveJogo = async (e) => {
    e.preventDefault();
    if (!jogoForm.modalidadeId || !jogoForm.dataHora || !jogoForm.local) return;
    const { id, ...payload } = jogoForm;
    id ? await updateJogo(id, payload) : await addJogo(payload);
    setJogoForm({ id: null, modalidadeId: "", dataHora: "", local: "", status: "agendado", delegacao1Id: "", delegacao2Id: "", placar1: "0", placar2: "0", descricaoGrupo: "" });
  };

  // Handlers Premiações
  const handleSavePremiacao = async (e) => {
    e.preventDefault();
    if (!premForm.modalidadeId) return;
    const { id, ...payload } = premForm;
    const existente = premiacoes.find((p) => p.modalidadeId === premForm.modalidadeId);
    const targetId = id || (existente ? existente.id : null);
    await salvarPremiacao(targetId, payload);
    setPremForm({ id: null, modalidadeId: "", ouroDelegacaoId: "", prataDelegacaoId: "", bronzeDelegacaoId: "" });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getNomeDelegacao = (id) => delegacoes.find((d) => d.id === id)?.nome || "Não atribuído";
  const getSiglaDelegacao = (id) => delegacoes.find((d) => d.id === id)?.sigla || "---";
  const getNomeModalidade = (id) => {
    const m = modalidades.find((mod) => mod.id === id);
    return m ? `${m.nome} (${m.genero} - ${m.faixaEtaria})` : "Modalidade";
  };

  return (
    <div className="admin-container">
      {/* HEADER ADMINISTRATIVO */}
      <header className="admin-header">
        <div className="admin-title-group">
          <h1>Painel de Gestão</h1>
          <p>IV Jogos dos Servidores IFSertãoPE</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Sair do Sistema
        </button>
      </header>

      {/* ABAS COM ROLAGEM HORIZONTAL NO MOBILE */}
      <nav className="admin-tabs">
        <button className={`tab-btn ${activeTab === "delegacoes" ? "active" : ""}`} onClick={() => setActiveTab("delegacoes")}>
          🏛️ Delegações ({delegacoes.length})
        </button>
        <button className={`tab-btn ${activeTab === "modalidades" ? "active" : ""}`} onClick={() => setActiveTab("modalidades")}>
          ⚽ Modalidades ({modalidades.length})
        </button>
        <button className={`tab-btn ${activeTab === "jogos" ? "active" : ""}`} onClick={() => setActiveTab("jogos")}>
          📅 Jogos ({jogos.length})
        </button>
        <button className={`tab-btn ${activeTab === "premiacoes" ? "active" : ""}`} onClick={() => setActiveTab("premiacoes")}>
          🥇 Medalhas ({premiacoes.length})
        </button>
      </nav>

      {/* ABA DELEGAÇÕES */}
      {activeTab === "delegacoes" && (
        <section>
          <div className="admin-card">
            <div className="admin-card-title">
              <span>{delForm.id ? "Editar Delegação" : "Nova Delegação (Câmpus)"}</span>
              {delForm.id && <span className="mode-badge">Modo Edição</span>}
            </div>
            <form onSubmit={handleSaveDelegacao}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome do Câmpus</label>
                  <input
                    type="text"
                    placeholder="Ex: Câmpus Central"
                    value={delForm.nome}
                    onChange={(e) => setDelForm({ ...delForm, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sigla</label>
                  <input
                    type="text"
                    placeholder="Ex: CTR"
                    value={delForm.sigla}
                    onChange={(e) => setDelForm({ ...delForm, sigla: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>URL do Logo (Opcional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={delForm.logoUrl}
                    onChange={(e) => setDelForm({ ...delForm, logoUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {delForm.id ? "Atualizar Delegação" : "Cadastrar Delegação"}
                </button>
                {delForm.id && (
                  <button type="button" className="btn-secondary" onClick={() => setDelForm({ id: null, nome: "", sigla: "", logoUrl: "" })}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <ul className="item-grid">
            {delegacoes.map((item) => (
              <li key={item.id} className="item-card">
                <div className="item-info">
                  <span className="item-title">[{item.sigla}] {item.nome}</span>
                </div>
                <div className="item-actions">
                  <button className="btn-sm btn-edit" onClick={() => setDelForm(item)}>Editar</button>
                  <button className="btn-sm btn-delete" onClick={() => deleteDelegacao(item.id)}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ABA MODALIDADES */}
      {activeTab === "modalidades" && (
        <section>
          <div className="admin-card">
            <div className="admin-card-title">
              <span>{modForm.id ? "Editar Modalidade" : "Nova Modalidade Esportiva"}</span>
              {modForm.id && <span className="mode-badge">Modo Edição</span>}
            </div>
            <form onSubmit={handleSaveModalidade}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome da Modalidade</label>
                  <input
                    type="text"
                    placeholder="Ex: Futsal, Xadrez"
                    value={modForm.nome}
                    onChange={(e) => setModForm({ ...modForm, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gênero</label>
                  <select value={modForm.genero} onChange={(e) => setModForm({ ...modForm, genero: e.target.value })}>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Misto">Misto</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Categoria / Faixa Etária</label>
                  <input
                    type="text"
                    placeholder="Ex: Livre, +40"
                    value={modForm.faixaEtaria}
                    onChange={(e) => setModForm({ ...modForm, faixaEtaria: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Formato</label>
                  <select value={modForm.formato} onChange={(e) => setModForm({ ...modForm, formato: e.target.value })}>
                    <option value="1v1">Confronto Direto (1 x 1)</option>
                    <option value="grupo_pista">Grupo / Pista</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{modForm.id ? "Atualizar" : "Salvar Modalidade"}</button>
                {modForm.id && (
                  <button type="button" className="btn-secondary" onClick={() => setModForm({ id: null, nome: "", genero: "M", faixaEtaria: "Livre", formato: "1v1" })}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <ul className="item-grid">
            {modalidades.map((item) => (
              <li key={item.id} className="item-card">
                <div className="item-info">
                  <span className="item-title">{item.nome}</span>
                  <span className="item-subtitle">Gênero: {item.genero} | Faixa: {item.faixaEtaria}</span>
                </div>
                <div className="item-actions">
                  <button className="btn-sm btn-edit" onClick={() => setModForm(item)}>Editar</button>
                  <button className="btn-sm btn-delete" onClick={() => deleteModalidade(item.id)}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ABA PROGRAMAÇÃO DE JOGOS */}
      {activeTab === "jogos" && (
        <section>
          <div className="admin-card">
            <div className="admin-card-title">
              <span>{jogoForm.id ? "Editar Partida" : "Cadastrar Nova Partida"}</span>
              {jogoForm.id && <span className="mode-badge">Modo Edição</span>}
            </div>
            <form onSubmit={handleSaveJogo}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Modalidade</label>
                  <select value={jogoForm.modalidadeId} onChange={(e) => setJogoForm({ ...jogoForm, modalidadeId: e.target.value })} required>
                    <option value="">-- Selecione --</option>
                    {modalidades.map((m) => (
                      <option key={m.id} value={m.id}>{m.nome} ({m.genero})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Data e Hora</label>
                  <input type="datetime-local" value={jogoForm.dataHora} onChange={(e) => setJogoForm({ ...jogoForm, dataHora: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Local / Quadra</label>
                  <input type="text" placeholder="Ex: Ginásio A" value={jogoForm.local} onChange={(e) => setJogoForm({ ...jogoForm, local: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={jogoForm.status} onChange={(e) => setJogoForm({ ...jogoForm, status: e.target.value })}>
                    <option value="agendado">Agendado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </div>
              </div>

              <fieldset style={{ marginTop: "10px" }}>
                <legend>Confronto Direto (Placar)</legend>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Delegação A</label>
                    <select value={jogoForm.delegacao1Id} onChange={(e) => setJogoForm({ ...jogoForm, delegacao1Id: e.target.value })}>
                      <option value="">-- Selecione --</option>
                      {delegacoes.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Placar A</label>
                    <input type="number" value={jogoForm.placar1} onChange={(e) => setJogoForm({ ...jogoForm, placar1: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Placar B</label>
                    <input type="number" value={jogoForm.placar2} onChange={(e) => setJogoForm({ ...jogoForm, placar2: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Delegação B</label>
                    <select value={jogoForm.delegacao2Id} onChange={(e) => setJogoForm({ ...jogoForm, delegacao2Id: e.target.value })}>
                      <option value="">-- Selecione --</option>
                      {delegacoes.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                    </select>
                  </div>
                </div>
              </fieldset>

              <div className="form-actions">
                <button type="submit" className="btn-primary">{jogoForm.id ? "Atualizar Jogo" : "Cadastrar Jogo"}</button>
                {jogoForm.id && (
                  <button type="button" className="btn-secondary" onClick={() => setJogoForm({ id: null, modalidadeId: "", dataHora: "", local: "", status: "agendado", delegacao1Id: "", delegacao2Id: "", placar1: "0", placar2: "0", descricaoGrupo: "" })}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <ul className="item-grid">
            {jogos.map((j) => (
              <li key={j.id} className="item-card">
                <div className="item-info">
                  <span className={`status-badge status-${j.status}`}>{j.status.replace("_", " ").toUpperCase()}</span>
                  <span className="item-title">{getNomeModalidade(j.modalidadeId)}</span>
                  <span className="item-subtitle">📍 {j.local} | 🕒 {j.dataHora}</span>
                  {j.delegacao1Id && j.delegacao2Id ? (
                    <strong>{getSiglaDelegacao(j.delegacao1Id)} {j.placar1} x {j.placar2} {getSiglaDelegacao(j.delegacao2Id)}</strong>
                  ) : (
                    <span className="item-subtitle">{j.descricaoGrupo}</span>
                  )}
                </div>
                <div className="item-actions">
                  <button className="btn-sm btn-edit" onClick={() => setJogoForm(j)}>Editar</button>
                  <button className="btn-sm btn-delete" onClick={() => deleteJogo(j.id)}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ABA PREMIAÇÕES */}
      {activeTab === "premiacoes" && (
        <section>
          <div className="admin-card">
            <div className="admin-card-title">
              <span>Lançar Resultado de Medalhas</span>
            </div>
            <form onSubmit={handleSavePremiacao}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Modalidade</label>
                  <select value={premForm.modalidadeId} onChange={(e) => setPremForm({ ...premForm, modalidadeId: e.target.value })} required>
                    <option value="">-- Selecione --</option>
                    {modalidades.map((m) => (
                      <option key={m.id} value={m.id}>{m.nome} ({m.genero})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>🥇 Medalha de Ouro</label>
                  <select value={premForm.ouroDelegacaoId} onChange={(e) => setPremForm({ ...premForm, ouroDelegacaoId: e.target.value })}>
                    <option value="">-- Selecione --</option>
                    {delegacoes.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>🥈 Medalha de Prata</label>
                  <select value={premForm.prataDelegacaoId} onChange={(e) => setPremForm({ ...premForm, prataDelegacaoId: e.target.value })}>
                    <option value="">-- Selecione --</option>
                    {delegacoes.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>🥉 Medalha de Bronze</label>
                  <select value={premForm.bronzeDelegacaoId} onChange={(e) => setPremForm({ ...premForm, bronzeDelegacaoId: e.target.value })}>
                    <option value="">-- Selecione --</option>
                    {delegacoes.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Salvar Premiação</button>
              </div>
            </form>
          </div>

          <ul className="item-grid">
            {premiacoes.map((p) => (
              <li key={p.id} className="item-card">
                <div className="item-info">
                  <span className="item-title">{getNomeModalidade(p.modalidadeId)}</span>
                  <span className="item-subtitle">🥇 {getNomeDelegacao(p.ouroDelegacaoId)}</span>
                  <span className="item-subtitle">🥈 {getNomeDelegacao(p.prataDelegacaoId)}</span>
                  <span className="item-subtitle">🥉 {getNomeDelegacao(p.bronzeDelegacaoId)}</span>
                </div>
                <div className="item-actions">
                  <button className="btn-sm btn-edit" onClick={() => setPremForm(p)}>Editar</button>
                  <button className="btn-sm btn-delete" onClick={() => deletePremiacao(p.id)}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};