import './App.css';
import { useEffect, useState } from 'react';
import Main from './Main';
import Navbar from './Navbar/Navbar';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./Components/firebase";
import AdminNavbar from './Admin/AdminNavbar';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="App">
      {isAdmin ? <AdminNavbar setIsAdmin={setIsAdmin} /> : <Navbar />}
      <Main />
    </div>
  );
}

export default App;
