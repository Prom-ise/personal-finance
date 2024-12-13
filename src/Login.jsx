import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "./App.css";
import loginPic1 from "./assets/loginPic.jfif";
import loginPic2 from "./assets/loginPic2.jfif";
import loginPic3 from "./assets/loginPic3.jfif";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXGnf7QilajaVht7_V2yzyPZNRQqUFT8Y",
  authDomain: "personal-finance11.firebaseapp.com",
  projectId: "personal-finance11",
  storageBucket: "personal-finance11.appspot.com",
  messagingSenderId: "293732505643",
  appId: "1:293732505643:web:b185cf020d7712494ab26e",
  measurementId: "G-Z788F6S47Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Background images
const backgroundImages = [loginPic1, loginPic2, loginPic3];

const Login = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Change the background image every 5 seconds
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, []);

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log(user);
        navigate("./Pfm"); // Navigate to the dashboard after login
      })
      .catch((error) => {
        console.error("Error during sign-in:", error);
      });
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${backgroundImages[activeIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)", // Optional for readability
      }}
    >
      <div className="static-content">
        <h1 className="text-4xl font-bold mb-4">Personal Finance Manager</h1>
        <button
          onClick={signIn}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
