// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Adicione outras importações conforme necessário (ex: getStorage, etc.)

// TODO: Substitua pelas suas credenciais obtidas no Console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAlkTrIPyEzRQR4_LHXmMBvt_I1mzGQrhY",
  authDomain: "jogos-dos-servidores.firebaseapp.com",
  projectId: "jogos-dos-servidores",
  storageBucket: "jogos-dos-servidores.firebasestorage.app",
  messagingSenderId: "489035171885",
  appId: "1:489035171885:web:52010e26b1e97989df10a4",
  measurementId: "G-0E2L7TC664"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportar os serviços que você vai utilizar no projeto
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;