import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

// ==========================================================================
// DELEGAÇÕES (CÂMPUS)
// ==========================================================================
export const subscribeDelegacoes = (callback) => {
  return onSnapshot(collection(db, "delegacoes"), (snapshot) => {
    const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(list);
  });
};

export const addDelegacao = async (data) => {
  const { id, ...cleanData } = data;
  return await addDoc(collection(db, "delegacoes"), cleanData);
};

export const updateDelegacao = async (id, data) => {
  const { id: _, ...cleanData } = data;
  return await updateDoc(doc(db, "delegacoes", id), cleanData);
};

export const deleteDelegacao = async (id) => {
  if (!id) return;
  return await deleteDoc(doc(db, "delegacoes", id));
};

// ==========================================================================
// MODALIDADES ESPORTIVAS
// ==========================================================================
export const subscribeModalidades = (callback) => {
  return onSnapshot(collection(db, "modalidades"), (snapshot) => {
    const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(list);
  });
};

export const addModalidade = async (data) => {
  const { id, ...cleanData } = data;
  return await addDoc(collection(db, "modalidades"), cleanData);
};

export const updateModalidade = async (id, data) => {
  const { id: _, ...cleanData } = data;
  return await updateDoc(doc(db, "modalidades", id), cleanData);
};

export const deleteModalidade = async (id) => {
  if (!id) return;
  return await deleteDoc(doc(db, "modalidades", id));
};

// ==========================================================================
// AGENDA E PLACAR DE JOGOS
// ==========================================================================
export const subscribeJogos = (callback) => {
  return onSnapshot(collection(db, "jogos"), (snapshot) => {
    const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(list);
  });
};

export const addJogo = async (data) => {
  const { id, ...cleanData } = data;
  return await addDoc(collection(db, "jogos"), cleanData);
};

export const updateJogo = async (id, data) => {
  const { id: _, ...cleanData } = data;
  return await updateDoc(doc(db, "jogos", id), cleanData);
};

export const deleteJogo = async (id) => {
  if (!id) return;
  return await deleteDoc(doc(db, "jogos", id));
};

// ==========================================================================
// PREMIAÇÕES E MEDALHAS
// ==========================================================================
export const subscribePremiacoes = (callback) => {
  return onSnapshot(collection(db, "premiacoes"), (snapshot) => {
    const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(list);
  });
};

export const salvarPremiacao = async (id, data) => {
  const { id: _, ...cleanData } = data;
  if (id) {
    return await updateDoc(doc(db, "premiacoes", id), cleanData);
  } else {
    return await addDoc(collection(db, "premiacoes"), cleanData);
  }
};

export const deletePremiacao = async (id) => {
  if (!id) return;
  return await deleteDoc(doc(db, "premiacoes", id));
};

// ==========================================================================
// CÁLCULO DO QUADRO DE MEDALHAS (CRITÉRIO OLÍMPICO)
// ==========================================================================
export const calcularQuadroMedalhas = (delegacoes, premiacoes) => {
  const tabela = delegacoes.map((d) => ({
    id: d.id,
    nome: d.nome,
    sigla: d.sigla,
    logoUrl: d.logoUrl || "",
    ouro: 0,
    prata: 0,
    bronze: 0,
    total: 0,
  }));

  premiacoes.forEach((p) => {
    if (p.ouroDelegacaoId) {
      const item = tabela.find((t) => t.id === p.ouroDelegacaoId);
      if (item) item.ouro += 1;
    }
    if (p.prataDelegacaoId) {
      const item = tabela.find((t) => t.id === p.prataDelegacaoId);
      if (item) item.prata += 1;
    }
    if (p.bronzeDelegacaoId) {
      const item = tabela.find((t) => t.id === p.bronzeDelegacaoId);
      if (item) item.bronze += 1;
    }
  });

  tabela.forEach((t) => {
    t.total = t.ouro + t.prata + t.bronze;
  });

  return tabela.sort((a, b) => {
    if (b.ouro !== a.ouro) return b.ouro - a.ouro;
    if (b.prata !== a.prata) return b.prata - a.prata;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    return a.nome.localeCompare(b.nome);
  });
};