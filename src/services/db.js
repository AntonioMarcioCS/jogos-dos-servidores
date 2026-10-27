import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "./firebase";

// === DELEGAÇÕES ===
export const subscribeDelegacoes = (callback) => {
  const q = query(collection(db, "delegacoes"), orderBy("nome"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const addDelegacao = (data) => addDoc(collection(db, "delegacoes"), data);
export const updateDelegacao = (id, data) => updateDoc(doc(db, "delegacoes", id), data);
export const deleteDelegacao = (id) => deleteDoc(doc(db, "delegacoes", id));

// === MODALIDADES ===
export const subscribeModalidades = (callback) => {
  const q = query(collection(db, "modalidades"), orderBy("nome"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const addModalidade = (data) => addDoc(collection(db, "modalidades"), data);
export const updateModalidade = (id, data) => updateDoc(doc(db, "modalidades", id), data);
export const deleteModalidade = (id) => deleteDoc(doc(db, "modalidades", id));

// === JOGOS E PROGRAMAÇÃO ===
export const subscribeJogos = (callback) => {
  const q = query(collection(db, "jogos"), orderBy("dataHora", "asc"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const addJogo = (data) => addDoc(collection(db, "jogos"), data);
export const updateJogo = (id, data) => updateDoc(doc(db, "jogos", id), data);
export const deleteJogo = (id) => deleteDoc(doc(db, "jogos", id));

// === PREMIAÇÕES ===
export const subscribePremiacoes = (callback) => {
  return onSnapshot(collection(db, "premiacoes"), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const salvarPremiacao = (id, data) => {
  if (id) {
    return updateDoc(doc(db, "premiacoes", id), data);
  }
  return addDoc(collection(db, "premiacoes"), data);
};

export const deletePremiacao = (id) => deleteDoc(doc(db, "premiacoes", id));

// === ALGORITMO DE CLASSIFICAÇÃO OLÍMPICA ===
export const calcularQuadroMedalhas = (delegacoes, premiacoes) => {
  const rankingMap = {};

  // Inicializa a pontuação de todas as delegações
  delegacoes.forEach((d) => {
    rankingMap[d.id] = {
      id: d.id,
      nome: d.nome,
      sigla: d.sigla,
      logoUrl: d.logoUrl || "",
      ouro: 0,
      prata: 0,
      bronze: 0,
      total: 0,
    };
  });

  // Somatório das medalhas
  premiacoes.forEach((p) => {
    if (p.ouroDelegacaoId && rankingMap[p.ouroDelegacaoId]) {
      rankingMap[p.ouroDelegacaoId].ouro += 1;
    }
    if (p.prataDelegacaoId && rankingMap[p.prataDelegacaoId]) {
      rankingMap[p.prataDelegacaoId].prata += 1;
    }
    if (p.bronzeDelegacaoId && rankingMap[p.bronzeDelegacaoId]) {
      rankingMap[p.bronzeDelegacaoId].bronze += 1;
    }
  });

  const lista = Object.values(rankingMap).map((item) => ({
    ...item,
    total: item.ouro + item.prata + item.bronze,
  }));

  // Critério Olímpico: Ouro > Prata > Bronze > Alfabetico
  return lista.sort((a, b) => {
    if (b.ouro !== a.ouro) return b.ouro - a.ouro;
    if (b.prata !== a.prata) return b.prata - a.prata;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    return a.nome.localeCompare(b.nome);
  });
};