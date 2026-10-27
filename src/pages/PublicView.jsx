import React, { useState, useEffect } from "react";
import {
  subscribeDelegacoes,
  subscribeModalidades,
  subscribeJogos,
  subscribePremiacoes,
  calcularQuadroMedalhas,
} from "../services/db";

export const PublicView = () => {
  const [delegacoes, setDelegacoes] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [premiacoes, setPremiacoes] = useState([]);

  const [activeView, setActiveView] = useState("medalhas");
  const [autoPlay, setAutoPlay] = useState(true);

  const INTERVALO_CARROSSEL = 15000;

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

  useEffect(() => {
    let timer;
    if (autoPlay) {
      timer = setInterval(() => {
        setActiveView((prev) => (prev === "medalhas" ? "jogos" : "medalhas"));
      }, INTERVALO_CARROSSEL);
    }
    return () => clearInterval(timer);
  }, [autoPlay]);

  const getDelegacao = (id) => delegacoes.find((d) => d.id === id);
  const getNomeDelegacao = (id) => getDelegacao(id)?.nome || "A definir";
  const getSiglaDelegacao = (id) => getDelegacao(id)?.sigla || "---";

  const getNomeModalidade = (id) => {
    const m = modalidades.find((mod) => mod.id === id);
    return m ? `${m.nome} (${m.genero} - ${m.faixaEtaria})` : "Modalidade";
  };

  const rankingMedalhas = calcularQuadroMedalhas(delegacoes, premiacoes);

  const jogosEmAndamento = jogos.filter((j) => j.status === "em_andamento");
  const jogosAgendados = jogos.filter((j) => j.status === "agendado");
  const jogosEncerrados = jogos.filter((j) => j.status === "encerrado");

  return (
    <div className="public-container">
      {/* CABEÇALHO COM LOGO OFICIAL */}
      <header className="public-header">
        <div className="logo-wrapper">
          <img 
            src="/logo-jogos.jpg" 
            alt="IV Jogos dos Servidores IFSertãoPE 2026" 
            className="brand-logo"
          />
        </div>

        {/* CONTROLES DO CARROSSEL */}
        <div className="controls-nav">
          <button
            className={activeView === "medalhas" ? "btn-active" : ""}
            onClick={() => setActiveView("medalhas")}
          >
            🥇 Quadro de Medalhas
          </button>
          <button
            className={activeView === "jogos" ? "btn-active" : ""}
            onClick={() => setActiveView("jogos")}
          >
            📅 Agenda de Jogos
          </button>
          <button className="btn-autoplay" onClick={() => setAutoPlay(!autoPlay)}>
            {autoPlay ? "⏸️ Pausar Carrossel TV" : "▶️ Iniciar Carrossel TV"}
          </button>
        </div>
      </header>

      {/* TELA 1: QUADRO DE MEDALHAS */}
      {activeView === "medalhas" && (
        <main className="view-content">
          <h2 className="section-title">Quadro Geral de Medalhas</h2>
          <div className="table-responsive">
            <table className="medal-table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Câmpus / Delegação</th>
                  <th>🥇 Ouro</th>
                  <th>🥈 Prata</th>
                  <th>🥉 Bronze</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rankingMedalhas.map((item, index) => (
                  <tr key={item.id} className={`rank-row rank-${index + 1}`}>
                    <td className="rank-position">{index + 1}º</td>
                    <td className="campus-name">
                      {item.logoUrl && (
                        <img src={item.logoUrl} alt={item.sigla} className="campus-logo" />
                      )}
                      <strong>[{item.sigla}]</strong> {item.nome}
                    </td>
                    <td className="col-gold">{item.ouro}</td>
                    <td className="col-silver">{item.prata}</td>
                    <td className="col-bronze">{item.bronze}</td>
                    <td className="col-total">{item.total}</td>
                  </tr>
                ))}
                {rankingMedalhas.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-message">Nenhuma delegação cadastrada ou sem medalhas atribuídas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* TELA 2: AGENDA DE JOGOS */}
      {activeView === "jogos" && (
        <main className="view-content">
          <h2 className="section-title">Programação e Resultados dos Jogos</h2>

          {/* JOGOS EM ANDAMENTO */}
          <section className="games-section live-section">
            <h3 className="status-heading live-heading">🔴 Acontecendo Agora</h3>
            {jogosEmAndamento.length === 0 ? (
              <p className="empty-message">Nenhuma partida em andamento no momento.</p>
            ) : (
              <ul className="games-grid">
                {jogosEmAndamento.map((j) => (
                  <li key={j.id} className="game-card live-card">
                    <div className="game-modalidade">{getNomeModalidade(j.modalidadeId)}</div>
                    <div className="game-local">📍 {j.local}</div>
                    <div className="game-match">
                      {j.delegacao1Id && j.delegacao2Id ? (
                        <div className="score-board">
                          <span className="team">{getSiglaDelegacao(j.delegacao1Id)}</span>
                          <span className="score">{j.placar1}</span>
                          <span className="vs">x</span>
                          <span className="score">{j.placar2}</span>
                          <span className="team">{getSiglaDelegacao(j.delegacao2Id)}</span>
                        </div>
                      ) : (
                        <div className="group-info">{j.descricaoGrupo}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* PRÓXIMOS JOGOS */}
          <section className="games-section">
            <h3 className="status-heading scheduled-heading">⏳ Próximos Jogos</h3>
            {jogosAgendados.length === 0 ? (
              <p className="empty-message">Não há partidas agendadas.</p>
            ) : (
              <ul className="games-grid">
                {jogosAgendados.map((j) => (
                  <li key={j.id} className="game-card">
                    <div className="game-time">🕒 {j.dataHora} - 📍 {j.local}</div>
                    <div className="game-modalidade">{getNomeModalidade(j.modalidadeId)}</div>
                    <div className="game-match-preview">
                      {j.delegacao1Id && j.delegacao2Id ? (
                        <span>{getNomeDelegacao(j.delegacao1Id)} <strong>VS</strong> {getNomeDelegacao(j.delegacao2Id)}</span>
                      ) : (
                        <span>{j.descricaoGrupo || "Múltiplos participantes"}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* JOGOS ENCERRADOS */}
          <section className="games-section">
            <h3 className="status-heading finished-heading">✅ Jogos Encerrados</h3>
            {jogosEncerrados.length === 0 ? (
              <p className="empty-message">Nenhum jogo encerrado até o momento.</p>
            ) : (
              <ul className="games-grid">
                {jogosEncerrados.map((j) => (
                  <li key={j.id} className="game-card finished-card">
                    <div className="game-modalidade">{getNomeModalidade(j.modalidadeId)}</div>
                    {j.delegacao1Id && j.delegacao2Id ? (
                      <div className="score-board small">
                        <span className="team">{getSiglaDelegacao(j.delegacao1Id)}</span>
                        <span className="score">{j.placar1}</span>
                        <span className="vs">-</span>
                        <span className="score">{j.placar2}</span>
                        <span className="team">{getSiglaDelegacao(j.delegacao2Id)}</span>
                      </div>
                    ) : (
                      <div className="group-info">{j.descricaoGrupo}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      )}
    </div>
  );
};