import { Navigate, Outlet } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyBXGnf7QilajaVht7_V2yzyPZNRQqUFT8Y",
  authDomain: "personal-finance11.firebaseapp.com",
  projectId: "personal-finance11",
  storageBucket: "personal-finance11.appspot.com",
  messagingSenderId: "293732505643",
  appId: "1:293732505643:web:b185cf020d7712494ab26e",
  measurementId: "G-Z788F6S47Q",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const ProtectedRoute = () => {
  const [user, setUser] = useState(null); // Holds user state
  const [loading, setLoading] = useState(true); // Indicates loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener when the component unmounts
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
