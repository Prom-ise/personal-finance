"use client";

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Pfm from "./Pfm"
import { useNavigate } from "react-router-dom";
import BudgetDoughnutChart from "./components/ui/component/BudgetDoughnutChart";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDoc,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement, // Import BarElement for bar charts
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BookDashed,
  Coins,
  HelpCircle,
  DollarSign,
  LogOut,
  ArrowUp,
  PieChart,
  GoalIcon,
  Calendar,
  Bell,
  Calculator,
  Edit,
  ArrowUpRight
} from "lucide-react";

// Initialize Chart.js
ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
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
const db = getFirestore(app);

export default function App() { 

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user);
  //   });
  //   return () => unsubscribe();
  // }, []);

  const navigate = useNavigate();

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log(user);
        // Navigate to the desired route after successful sign-in
        navigate("./Pfm");
      })
      .catch((error) => {
        console.error("Error during sign-in:", error);
      });
  };

  return (
   <>
      <ToastContainer className={"fixed"} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pfm" element={<ProtectedRoute />}>
          <Route index element={<Pfm />} />
        </Route>
      </Routes>
    </>
  );
}
