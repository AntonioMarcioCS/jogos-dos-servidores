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

  // Controle de abas
  const [activeTab, setActiveTab] = useState("delegacoes");

  // Listas em tempo real
  const [delegacoes, setDelegacoes] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [premiacoes, setPremiacoes] = useState([]);

  // Formulário Delegações
  const [delForm, setDelForm] = useState({ id: null, nome: "", sigla: "", logoUrl: "" });

  // Formulário Modalidades
  const [modForm, setModForm] = useState({
    id: null,
    nome: "",
    genero: "M",
    faixaEtaria: "Livre",
    formato: "1v1",
  });

  // Formulário Jogos
  const [jogoForm, setJogoForm] = useState({
    id: null,
    modalidadeId: "",
    dataHora: "",
    local: "",
    status: "agendado",
    delegacao1Id: "",
    delegacao2Id: "",
    placar1: "0",
    placar2: "0",
    descricaoGrupo: "", // Para modalidades em grupo/pista
  });

  // Formulário Premiações
  const [premForm, setPremForm] = useState({
    id: null,
    modalidadeId: "",
    ouroDelegacaoId: "",
    prataDelegacaoId: "",
    bronzeDelegacaoId: "",
  });

  // Inscrever nos escutadores Firestore em tempo real
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

  // --- LÓGICA DE DELEGAÇÕES ---
  const handleSaveDelegacao = async (e) => {
    e.preventDefault();
    if (!delForm.nome || !delForm.sigla) return;

    if (delForm.id) {
      await updateDelegacao(delForm.id, {
        nome: delForm.nome,
        sigla: delForm.sigla.toUpperCase(),
        logoUrl: delForm.logoUrl,
      });
    } else {
      await addDelegacao({
        nome: delForm.nome,
        sigla: delForm.sigla.toUpperCase(),
        logoUrl: delForm.logoUrl,
      });
    }
    resetDelForm();
  };

  const resetDelForm = () => setDelForm({ id: null, nome: "", sigla: "", logoUrl: "" });

  // --- LÓGICA DE MODALIDADES ---
  const handleSaveModalidade = async (e) => {
    e.preventDefault();
    if (!modForm.nome) return;

    if (modForm.id) {
      await updateModalidade(modForm.id, modForm);
    } else {
      await addModalidade(modForm);
    }
    resetModForm();
  };

  const resetModForm = () => setModForm({ id: null, nome: "", genero: "M", faixaEtaria: "Livre", formato: "1v1" });

  // --- LÓGICA DE JOGOS ---
  const handleSaveJogo = async (e) => {
    e.preventDefault();
    if (!jogoForm.modalidadeId || !jogoForm.dataHora || !jogoForm.local) {
      alert("Preencha os campos obrigatórios da partida.");
      return;
    }

    const payload = {
      modalidadeId: jogoForm.modalidadeId,
      dataHora: jogoForm.dataHora,
      local: jogoForm.local,
      status: jogoForm.status,
      delegacao1Id: jogoForm.delegacao1Id,
      delegacao2Id: jogoForm.delegacao2Id,
      placar1: jogoForm.placar1,
      placar2: jogoForm.placar2,
      descricaoGrupo: jogoForm.descricaoGrupo,
    };

    if (jogoForm.id) {
      await updateJogo(jogoForm.id, payload);
    } else {
      await addJogo(payload);
    }
    resetJogoForm();
  };

  const handleEditJogo = (item) => {
    setJogoForm({
      id: item.id,
      modalidadeId: item.modalidadeId || "",
      dataHora: item.dataHora || "",
      local: item.local || "",
      status: item.status || "agendado",
      delegacao1Id: item.delegacao1Id || "",
      delegacao2Id: item.delegacao2Id || "",
      placar1: item.placar1 || "0",
      placar2: item.placar2 || "0",
      descricaoGrupo: item.descricaoGrupo || "",
    });
  };

  const handleDeleteJogo = async (id) => {
    if (window.confirm("Deseja cancelar/excluir este jogo?")) {
      await deleteJogo(id);
    }
  };

  const resetJogoForm = () => {
    setJogoForm({
      id: null,
      modalidadeId: "",
      dataHora: "",
      local: "",
      status: "agendado",
      delegacao1Id: "",
      delegacao2Id: "",
      placar1: "0",
      placar2: "0",
      descricaoGrupo: "",
    });
  };

  // --- LÓGICA DE PREMIAÇÕES ---
  const handleSavePremiacao = async (e) => {
    e.preventDefault();
    if (!premForm.modalidadeId) {
      alert("Selecione uma modalidade.");
      return;
    }

    const payload = {
      modalidadeId: premForm.modalidadeId,
      ouroDelegacaoId: premForm.ouroDelegacaoId || null,
      prataDelegacaoId: premForm.prataDelegacaoId || null,
      bronzeDelegacaoId: premForm.bronzeDelegacaoId || null,
    };

    // Verifica se já existe premiação para essa modalidade
    const existente = premiacoes.find((p) => p.modalidadeId === premForm.modalidadeId);
    const targetId = premForm.id || (existente ? existente.id : null);

    await salvarPremiacao(targetId, payload);
    resetPremForm();
  };

  const handleEditPremiacao = (item) => {
    setPremForm({
      id: item.id,
      modalidadeId: item.modalidadeId || "",
      ouroDelegacaoId: item.ouroDelegacaoId || "",
      prataDelegacaoId: item.prataDelegacaoId || "",
      bronzeDelegacaoId: item.bronzeDelegacaoId || "",
    });
  };

  const handleDeletePremiacao = async (id) => {
    if (window.confirm("Deseja remover o resultado de medalhas desta modalidade?")) {
      await deletePremiacao(id);
    }
  };

  const resetPremForm = () => {
    setPremForm({
      id: null,
      modalidadeId: "",
      ouroDelegacaoId: "",
      prataDelegacaoId: "",
      bronzeDelegacaoId: "",
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Funções auxiliares para buscar nomes
  const getNomeDelegacao = (id) => delegacoes.find((d) => d.id === id)?.nome || "Não atribuído";
  const getNomeModalidade = (id) => {
    const m = modalidades.find((mod) => mod.id === id);
    return m ? `${m.nome} (${m.genero} - ${m.faixaEtaria})` : "Desconhecida";
  };

  return (
    <div>
      <header>
        <h1>Painel Administrativo - Jogos dos Servidores</h1>
        <button onClick={handleLogout}>Sair do Sistema</button>
      </header>

      <nav>
        <button onClick={() => setActiveTab("delegacoes")}>Delegações (Câmpus)</button>
        <button onClick={() => setActiveTab("modalidades")}>Modalidades Esportivas</button>
        <button onClick={() => setActiveTab("jogos")}>Programação de Jogos</button>
        <button onClick={() => setActiveTab("premiacoes")}>Quadro de Premiações</button>
      </nav>

      <hr />

      {/* ABA DELEGAÇÕES */}
      {activeTab === "delegacoes" && (
        <section>
          <h2>{delForm.id ? "Editar Delegação" : "Cadastrar Nova Delegação"}</h2>
          <form onSubmit={handleSaveDelegacao}>
            <input
              type="text"
              placeholder="Nome do Câmpus (ex: Câmpus Central)"
              value={delForm.nome}
              onChange={(e) => setDelForm({ ...delForm, nome: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Sigla (ex: CTR)"
              value={delForm.sigla}
              onChange={(e) => setDelForm({ ...delForm, sigla: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="URL do Logo / Brasão (opcional)"
              value={delForm.logoUrl}
              onChange={(e) => setDelForm({ ...delForm, logoUrl: e.target.value })}
            />
            <button type="submit">{delForm.id ? "Atualizar" : "Salvar"}</button>
            {delForm.id && <button type="button" onClick={resetDelForm}>Cancelar</button>}
          </form>

          <h3>Delegações Cadastradas ({delegacoes.length})</h3>
          <ul>
            {delegacoes.map((item) => (
              <li key={item.id}>
                <strong>[{item.sigla}]</strong> {item.nome}
                <button onClick={() => setDelForm({ id: item.id, nome: item.nome, sigla: item.sigla, logoUrl: item.logoUrl || "" })}>Editar</button>
                <button onClick={() => deleteDelegacao(item.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ABA MODALIDADES */}
      {activeTab === "modalidades" && (
        <section>
          <h2>{modForm.id ? "Editar Modalidade" : "Cadastrar Nova Modalidade"}</h2>
          <form onSubmit={handleSaveModalidade}>
            <input
              type="text"
              placeholder="Nome da Modalidade (ex: Futsal, Atletismo 100m)"
              value={modForm.nome}
              onChange={(e) => setModForm({ ...modForm, nome: e.target.value })}
              required
            />
            <label>Gênero: </label>
            <select value={modForm.genero} onChange={(e) => setModForm({ ...modForm, genero: e.target.value })}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="Misto">Misto</option>
            </select>
            <input
              type="text"
              placeholder="Categoria / Faixa Etária"
              value={modForm.faixaEtaria}
              onChange={(e) => setModForm({ ...modForm, faixaEtaria: e.target.value })}
              required
            />
            <label>Formato: </label>
            <select value={modForm.formato} onChange={(e) => setModForm({ ...modForm, formato: e.target.value })}>
              <option value="1v1">Confronto Direto (1 x 1)</option>
              <option value="grupo_pista">Grupo / Pista (Múltiplos Câmpus)</option>
            </select>
            <button type="submit">{modForm.id ? "Atualizar" : "Salvar"}</button>
            {modForm.id && <button type="button" onClick={resetModForm}>Cancelar</button>}
          </form>

          <h3>Modalidades Cadastradas ({modalidades.length})</h3>
          <ul>
            {modalidades.map((item) => (
              <li key={item.id}>
                <strong>{item.nome}</strong> | Gênero: {item.genero} | Faixa: {item.faixaEtaria} | Formato: {item.formato}
                <button onClick={() => setModForm(item)}>Editar</button>
                <button onClick={() => deleteModalidade(item.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ABA PROGRAMAÇÃO DE JOGOS */}
      {activeTab === "jogos" && (
        <section>
          <h2>{jogoForm.id ? "Editar Partida/Evento" : "Cadastrar Novo Jogo/Evento"}</h2>
          <form onSubmit={handleSaveJogo}>
            <label>Modalidade: </label>
            <select
              value={jogoForm.modalidadeId}
              onChange={(e) => setJogoForm({ ...jogoForm, modalidadeId: e.target.value })}
              required
            >
              <option value="">-- Selecione a Modalidade --</option>
              {modalidades.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.genero} - {m.faixaEtaria})
                </option>
              ))}
            </select>

            <br />
            <label>Data e Horário: </label>
            <input
              type="datetime-local"
              value={jogoForm.dataHora}
              onChange={(e) => setJogoForm({ ...jogoForm, dataHora: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Local (ex: Quadra A, Campo 1)"
              value={jogoForm.local}
              onChange={(e) => setJogoForm({ ...jogoForm, local: e.target.value })}
              required
            />

            <label>Status: </label>
            <select
              value={jogoForm.status}
              onChange={(e) => setJogoForm({ ...jogoForm, status: e.target.value })}
            >
              <option value="agendado">Agendado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="encerrado">Encerrado</option>
            </select>

            <fieldset>
              <legend>Participantes e Placar (Confronto 1 x 1)</legend>
              <select
                value={jogoForm.delegacao1Id}
                onChange={(e) => setJogoForm({ ...jogoForm, delegacao1Id: e.target.value })}
              >
                <option value="">-- Câmpus A --</option>
                {delegacoes.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Placar A"
                value={jogoForm.placar1}
                onChange={(e) => setJogoForm({ ...jogoForm, placar1: e.target.value })}
              />
              <span> VS </span>
              <input
                type="number"
                placeholder="Placar B"
                value={jogoForm.placar2}
                onChange={(e) => setJogoForm({ ...jogoForm, placar2: e.target.value })}
              />
              <select
                value={jogoForm.delegacao2Id}
                onChange={(e) => setJogoForm({ ...jogoForm, delegacao2Id: e.target.value })}
              >
                <option value="">-- Câmpus B --</option>
                {delegacoes.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <legend>Observações / Resumo (Para modalidades em grupo/pista)</legend>
              <input
                type="text"
                placeholder="Ex: Bateria 1 - Câmpus A, B, C e D participando"
                value={jogoForm.descricaoGrupo}
                onChange={(e) => setJogoForm({ ...jogoForm, descricaoGrupo: e.target.value })}
              />
            </fieldset>

            <button type="submit">{jogoForm.id ? "Atualizar Jogo" : "Cadastrar Jogo"}</button>
            {jogoForm.id && <button type="button" onClick={resetJogoForm}>Cancelar</button>}
          </form>

          <h3>Lista de Jogos e Confrontos ({jogos.length})</h3>
          <ul>
            {jogos.map((j) => (
              <li key={j.id}>
                <strong>[{j.status.toUpperCase()}]</strong> {getNomeModalidade(j.modalidadeId)} - {j.local} ({j.dataHora})
                <br />
                {j.delegacao1Id && j.delegacao2Id ? (
                  <span>
                    {getNomeDelegacao(j.delegacao1Id)} <strong>{j.placar1}</strong> x <strong>{j.placar2}</strong> {getNomeDelegacao(j.delegacao2Id)}
                  </span>
                ) : (
                  <span>{j.descricaoGrupo || "Múltiplos participantes"}</span>
                )}
                <button onClick={() => handleEditJogo(j)}>Editar</button>
                <button onClick={() => handleDeleteJogo(j.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ABA LANÇAMENTO DE PREMIAÇÕES / MEDALHAS */}
      {activeTab === "premiacoes" && (
        <section>
          <h2>{premForm.id ? "Editar Medalhas da Modalidade" : "Atribuir Medalhas por Modalidade"}</h2>
          <form onSubmit={handleSavePremiacao}>
            <label>Selecione a Modalidade: </label>
            <select
              value={premForm.modalidadeId}
              onChange={(e) => setPremForm({ ...premForm, modalidadeId: e.target.value })}
              required
            >
              <option value="">-- Selecione a Modalidade --</option>
              {modalidades.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.genero} - {m.faixaEtaria})
                </option>
              ))}
            </select>

            <br />
            <label>🥇 Medalha de OURO: </label>
            <select
              value={premForm.ouroDelegacaoId}
              onChange={(e) => setPremForm({ ...premForm, ouroDelegacaoId: e.target.value })}
            >
              <option value="">-- Ninguém / Não definido --</option>
              {delegacoes.map((d) => (
                <option key={d.id} value={d.id}>{d.nome} ({d.sigla})</option>
              ))}
            </select>

            <br />
            <label>🥈 Medalha de PRATA: </label>
            <select
              value={premForm.prataDelegacaoId}
              onChange={(e) => setPremForm({ ...premForm, prataDelegacaoId: e.target.value })}
            >
              <option value="">-- Ninguém / Não definido --</option>
              {delegacoes.map((d) => (
                <option key={d.id} value={d.id}>{d.nome} ({d.sigla})</option>
              ))}
            </select>

            <br />
            <label>🥉 Medalha de BRONZE: </label>
            <select
              value={premForm.bronzeDelegacaoId}
              onChange={(e) => setPremForm({ ...premForm, bronzeDelegacaoId: e.target.value })}
            >
              <option value="">-- Ninguém / Não definido --</option>
              {delegacoes.map((d) => (
                <option key={d.id} value={d.id}>{d.nome} ({d.sigla})</option>
              ))}
            </select>

            <br />
            <button type="submit">Salvar Premiação</button>
            {premForm.id && <button type="button" onClick={resetPremForm}>Cancelar</button>}
          </form>

          <h3>Resultados de Medalhas Gravados ({premiacoes.length})</h3>
          <ul>
            {premiacoes.map((p) => (
              <li key={p.id}>
                <strong>{getNomeModalidade(p.modalidadeId)}</strong>
                <br />
                🥇 Ouro: {getNomeDelegacao(p.ouroDelegacaoId)} | 🥈 Prata: {getNomeDelegacao(p.prataDelegacaoId)} | 🥉 Bronze: {getNomeDelegacao(p.bronzeDelegacaoId)}
                <button onClick={() => handleEditPremiacao(p)}>Editar</button>
                <button onClick={() => handleDeletePremiacao(p.id)}>Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};