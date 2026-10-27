// src/services/auth.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "./firebase"; // Importa a instância do auth configurada no passo anterior

/**
 * Cadastra um novo usuário com e-mail e senha
 */
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Faz login de um usuário existente com e-mail e senha
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Desconecta o usuário atual
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Observador para monitorar se o usuário está logado ou não em tempo real
 */
export const monitorAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};