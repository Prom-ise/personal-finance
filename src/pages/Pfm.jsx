import React, { useState, useEffect } from "react";
import BudgetDoughnutChart from "../components/ui/component/BudgetDoughnutChart";
// import "./App.css";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

const Pfm = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const [salary, setSalary] = useState(0);
  const [salaryId, setSalaryId] = useState(null);
  const [income, setIncome] = useState(0);
  const [incomeId, setIncomeId] = useState(null);
  const [budgetId, setBudgetId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budget, setBudget] = useState(0);
  const [category, setCategory] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [amount, setAmount] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [totalGoals, setTotalGoals] = useState(0);
  const [theme, setTheme] = useState("light-theme");
  const [totalCurrentAmount, setTotalCurrentAmount] = useState(0);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      console.error("No user is currently signed in.");
    }
  }, [auth]);


  const signOut = () => {
    auth.signOut();
    toast.success("Logout successfully")
    // window.location.href = "App.jsx";
  };

  const toggleTheme = () => {
    const newTheme = theme === "light-theme" ? "dark-theme" : "light-theme";
    setTheme(newTheme);
    document.documentElement.className = `${newTheme}`;
    localStorage.setItem("theme", newTheme);
  };
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light-theme";
    setTheme(savedTheme);
    document.documentElement.className = `${savedTheme}`;
  }, []);

  useEffect(() => {
    if (user) {
      fetchSalary();
      fetchIncome();
      fetchBudget();
      fetchExpenses();
      fetchGoals();
      fetchMonthlyData();
    }
  }, [user]);
  const fetchMonthlyData = async () => {
    if (!user) return;
  
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
    try {
      // Fetch current month's data
      const currentQuery = query(
        collection(db, "finances"),
        where("userId", "==", user.uid),
        where("month", "==", currentMonth),
        where("year", "==", currentYear)
      );
      const currentSnapshot = await getDoc(currentQuery);
      const currentData = currentSnapshot.docs.map((doc) => doc.data());
  
      // Fetch previous month's data
      const previousQuery = query(
        collection(db, "finances"),
        where("userId", "==", user.uid),
        where("month", "==", previousMonth),
        where("year", "==", previousYear)
      );
      const previousSnapshot = await getDoc(previousQuery);
      const previousData = previousSnapshot.docs.map((doc) => doc.data());
  
      // Calculate rate of change for each category
      const rates = calculateRateOfChange(currentData, previousData);
      setComparisonRates(rates);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    }
  };
  const calculateRateOfChange = (current, previous) => {
    const categories = ["income", "savings", "expenses", "budget"];
    const rates = {};
  
    categories.forEach((category) => {
      const currentValue = current.reduce((sum, item) => sum + (item[category] || 0), 0);
      const previousValue = previous.reduce((sum, item) => sum + (item[category] || 0), 0);
  
      if (previousValue === 0) {
        rates[category] = currentValue > 0 ? 100 : 0; // Avoid division by zero
      } else {
        rates[category] = ((currentValue - previousValue) / previousValue) * 100;
      }
    });
  
    return rates;
  };
  const fetchIncome = () => {
    if (!user) return;
    console.log("Fetching income for user:", user.uid);
    const q = query(collection(db, "income"), where("userId", "==", user.uid));
    onSnapshot(q, (querySnapshot) => {
      const fetchedIncome = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (fetchedIncome.length > 0) {
        setIncome(fetchedIncome[0].amount);
        setIncomeId(fetchedIncome[0].id);
      }
    });
  };
  const fetchSalary =() =>{
    if(!user)return;
    console.log("Fetching Salary for user:", user.uid);
    const q = query(collection(db, "salary"), where("userId", "==", user.uid));
    onSnapshot(q, (querySnapshot) => {
      const fetchedSalary = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (fetchedSalary.length > 0) {
        setSalary(fetchedSalary[0].amount);
        setSalaryId(fetchedSalary[0].id);
      }
    })
  }
  const fetchBudget = () => {
    if (!user) return;
    console.log("Fetching Budget for user:", user.uid);
    const q = query(collection(db, "budget"), where("userId", "==", user.uid));
    onSnapshot(q, (querySnapshot) => {
      const fetchedBudget = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (fetchedBudget.length > 0) {
        setBudget(fetchedBudget[0].amount);
        setBudgetId(fetchedBudget[0].id);
      }
    });
  };
  const handleSaveIncome = async () => {
    if (!user || income === 0) return;

    try {
      if (incomeId) {
        const incomeDocRef = doc(db, "income", incomeId);
        await updateDoc(incomeDocRef, {
          amount: income,
          date: Timestamp.now(),
        });
      } else {
        const docRef = await addDoc(collection(db, "income"), {
          userId: user.uid,
          amount: income,
          date: Timestamp.now(),
        });
        setIncomeId(docRef.id);
      }
      setIsEditing(false);
      toast.success("Income saved successfully!");
    } catch (error) {
      console.error("Error saving income:", error);
    }
  };
  const handleSaveSalary = async () => {
    if (!user || salary === 0) return;
  
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-based
    const currentYear = new Date().getFullYear();
  
    try {
      const salaryQuery = query(
        collection(db, "salary"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(1)
      );
      const salarySnapshot = await getDoc(salaryQuery);
  
      if (!salarySnapshot.empty) {
        const lastSalaryDoc = salarySnapshot.docs[0];
        const lastSalaryData = lastSalaryDoc.data();
        const lastSalaryDate = lastSalaryData.date.toDate();
  
        // Check if the last saved salary is for the current month
        if (
          lastSalaryDate.getMonth() + 1 === currentMonth &&
          lastSalaryDate.getFullYear() === currentYear
        ) {
          toast.error("You can only edit your salary once at the start of the month.");
          setIsEditing(false);
          return;
        }
      }
  
      // Save or update salary
      if (salaryId) {
        const salaryDocRef = doc(db, "salary", salaryId);
        await updateDoc(salaryDocRef, {
          amount: salary,
          date: Timestamp.now(),
        });
      } else {
        const docRef = await addDoc(collection(db, "salary"), {
          userId: user.uid,
          amount: salary,
          date: Timestamp.now(),
        });
        setSalaryId(docRef.id);
      }
  
      setIsEditing(false);
      toast.success("Salary saved successfully!");
    } catch (error) {
      console.error("Error saving salary:", error);
      toast.error("Failed to save salary.");
    }
  };
  const handleSaveBudget = async () => {
    if (budget > income) {
      toast.error("Monthly budget can't be more than monthly income");
      return;
    }
    if (!user || income === 0) return;

    try {
      if (budgetId) {
        const budgetDocRef = doc(db, "budget", budgetId);
        await updateDoc(budgetDocRef, {
          amount: budget,
          date: Timestamp.now(),
        });
      } else {
        const docRef = await addDoc(collection(db, "budget"), {
          userId: user.uid,
          amount: budget,
          date: Timestamp.now(),
        });
        setBudgetId(docRef.id);
      }
      setIsEditing(false);
      toast.success("Budget for the Month saved successfully!");
    } catch (error) {
      console.error("Error saving Budget:", error);
    }
  };
  const fetchExpenses = () => {
    if (!user) return;
    console.log("Fetching expenses for user:", user.uid);
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid)
    );
    onSnapshot(q, (querySnapshot) => {
      const fetchedExpenses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(fetchedExpenses);
    });
  };
  const fetchGoals = () => {
    if (!user) return;
    console.log("Fetching goals for user:", user.uid);
    const q = query(collection(db, "goals"), where("userId", "==", user.uid));
    onSnapshot(q, (querySnapshot) => {
      const fetchedGoals = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(fetchedGoals);
      const total = fetchedGoals.reduce((sum, goal) => sum + (goal.amount || 0), 0);
    setTotalGoals(total);
    const totals = fetchedGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
      setTotalCurrentAmount(totals);
    });
  };
  const addContribution = async () => {
    const contribution = parseFloat(contributionAmount);
  
    if (isNaN(contribution) || contribution <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }
  
    if (contribution > income) {
      toast.error("Not enough balance for this contribution");
      return;
    }
  
    try {
      // Fetch the selected goal
      const goalDocRef = doc(db, "goals", selectedGoalId);
      const goalDoc = await getDoc(goalDocRef);
  
      if (goalDoc.exists()) {
        const goalData = goalDoc.data();
        const remainingAmount = goalData.amount - goalData.currentAmount;
  
        if (goalData.currentAmount >= goalData.amount) {
          // Goal already fulfilled
          toast.error("This goal has already been fulfilled. No further contributions are needed.");
          return;
        }
  
        if (contribution > remainingAmount) {
          // Contribution exceeds the remaining amount
          toast.error(`You only need $${remainingAmount.toFixed(2)} to fulfill this goal.`);
          return;
        }
  
        // Update goal's current amount
        const updatedAmount = goalData.currentAmount + contribution;
        await updateDoc(goalDocRef, { currentAmount: updatedAmount });
  
        // Update income
        const newIncome = income - contribution;
        await updateDoc(doc(db, "income", incomeId), { amount: newIncome });
        setIncome(newIncome);
  
        toast.success("Contribution added successfully!");
        setContributionAmount(""); // Clear input
      } else {
        toast.error("Selected goal does not exist.");
      }
    } catch (error) {
      console.error("Error adding contribution:", error);
      toast.error("Error adding contribution");
    }
  };
  const addExpense = async () => {
    if (!user || !amount || !category) return;
    await addDoc(collection(db, "expenses"), {
      userId: user.uid,
      amount: parseFloat(amount),
      paymentInfo,
      category,
      date: Timestamp.now(),
    });
    setAmount("");
    setPaymentInfo("");
    setCategory("");
    fetchExpenses();
    toast.success("Expense added successfully!");
  };
  const addGoal = async () => {
    if (!user || !goalName || !goalAmount) return;
    await addDoc(collection(db, "goals"), {
      userId: user.uid,
      name: goalName,
      amount: parseFloat(goalAmount),
      currentAmount: 200,
    });
    setGoalName("");
    setGoalAmount("");
    fetchGoals();
    toast.success("Goal added successfully!");
  };
  const calculateDebtPayoff = () => {
    const debt = parseFloat(debtAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const payment = parseFloat(monthlyPayment);

    if (debt > 0 && rate > 0 && payment > 0) {
      const months = Math.ceil(
        Math.log(payment / (payment - rate * debt)) / Math.log(1 + rate)
      );
      const totalInterest = payment * months - debt;
      toast.success(
        `It will take ${months} months to pay off the debt. Total interest paid: $${totalInterest.toFixed(
          2
        )}`
      );
    } else {
      toast.error("Please enter valid numbers for all fields.");
    }
  };
  const chartData = {
    labels: expenses.map((expense) =>
      new Date(expense.date.seconds * 1000)
        .toLocaleDateString("en-GB", {
          day: "numeric",
          weekday: "short",
        })
        .replace(",", "")
    ),
    datasets: [
      {
        label: "Expenses for the Month of November",
        data: expenses.map((expense) => expense.amount),
        backgroundColor: "rgba(0, 2, 255, .7)", // Set bar color and transparency
      },
    ],
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const remainingBudget = budget - totalExpenses;
  const totalBalance = income - budget;

  return (
    <div className="container mx-auto p-4 bg-gradient-to-b min-h-screen">
        <ToastContainer className={"fixed"} />
         <Tabs defaultValue="dashboard" className="w-full flex">
          <div className="w-1/6 right-0 left-0 bottom-0 top-0 side-bar">
            <TabsList className="fixed tabs mt-[7.5em]">
              <nav className="nav">
                <h6 className="text-4xl font-bold text-indigo-700 mb-3">
                  P.F.M
                </h6>
                <ul>
                  <li>
                    <div>
                      <TabsTrigger value="dashboard">
                        <LayoutDashboard /> Dashboard
                      </TabsTrigger>
                    </div>
                  </li>
                  <li>
                    <div>
                      <TabsTrigger value="expenses">
                        <ArrowLeftRight /> Expenses
                      </TabsTrigger>
                    </div>
                  </li>
                  <li>
                    <div>
                      <TabsTrigger value="budget">
                        <Coins /> Budget
                      </TabsTrigger>
                    </div>
                  </li>
                  <li>
                    <div>
                      <TabsTrigger value="goals">
                        <GoalIcon /> Goals
                      </TabsTrigger>
                    </div>
                  </li>
                  <li>
                    <div>
                      <TabsTrigger value="reports">
                        <BookDashed /> Reports
                      </TabsTrigger>
                    </div>
                  </li>
                  <li>
                    <div>
                      <TabsTrigger value="debt">
                        <Calculator /> Debt Calculator
                      </TabsTrigger>
                    </div>
                  </li>
                </ul>
                <div className="fixed bottom-4"> 
<label className="switch">
  <span className="sun"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#ffd43b"><circle r="5" cy="12" cx="12"></circle><path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path></g></svg></span>
  <span className="moon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path></svg></span>   
  <input type="checkbox" id="toggle"
                checked={theme === "dark-theme"}
                onChange={toggleTheme}
                className="input"/>
  <span className="slider"></span>
</label>
                  <div className="my-3">
                    <TabsTrigger value="help">
                      <HelpCircle /> Help
                    </TabsTrigger>
                  </div>
                  <Button onClick={signOut} className="mt-2">
                    <LogOut /> Sign Out
                  </Button>
                </div>
                {/* {user ? (
          <div>
            <p className="text-lg text-indigo-600">Welcome, {user.displayName}!</p>
            <Button onClick={signOut} className="mt-2">Sign Out</Button>
          </div>
        ) : (
          <Button onClick={signIn}>Sign In with Google</Button>
        )} */}
              </nav>
            </TabsList>
          </div>

          <div className="w-5/6 mt-[-.5em]">
            <TabsContent value="dashboard">
              <Card>
              <div className="flex justify-between">
  {user ? (
    <>
      <div>
        <p className="text-start text-[1.5em] font-bold text-indigo-600">
          Welcome back, {user.displayName}!
        </p>
        <p>It is the best time to manage your finance</p>
      </div>
      <div>
        <div className="profile-dp">
          <div>
            <img
              className="dp"
              src={user.photoURL}
              alt={user.displayName}
            />
          </div>
          <div>
            <div className="name">{user.displayName}</div>
            <div className="email">{user.email}</div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <p className="text-center text-[1.5em] font-bold text-gray-500">
      Loading user data...
    </p>
  )}
</div>

                <CardHeader>
                  <CardTitle className='flex justify-between'>
                    <div>Financial Overview</div>
                    <div>Monthly Income: ${salary.toFixed(2)}</div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                {/* <div>
                      <Label htmlFor="salary">Monthly Salary</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(parseFloat(e.target.value))}
                        placeholder="Enter your monthly Salary"
                        disabled={!isEditing} // Disable input unless editing
                      />
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Salary
                      </Button>
                      <Button
                        onClick={handleSaveSalary}
                        className="btn btn-primary mt-2"
                      >
                        Save Salary
                      </Button>
                    </div> */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="finances relative">
                      <h3 className="text-lg font-semibold mb-2">
                        Total balance
                      </h3>
                      <p className="text-2xl font-bold">
                        ${totalBalance.toFixed(2)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <div className="rate">
                          <span>
                            <ArrowUp className="w-[15px]" />
                          </span>
                          <span>12.1%</span>
                        </div>
                        <div className="text-[gainsboro]">vs last month</div>
                      </div>
                    </div>
                    <div className="finances">
                      <h3 className="text-lg font-semibold mb-2">Savings</h3>
                      <p className="text-2xl font-bold ">
                      {/* ${totalGoals.toFixed(2)} */}
                      ${totalCurrentAmount.toFixed(2)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <div className="rate">
                          <span>
                            <ArrowUp className="w-[15px]" />
                          </span>
                          <span>6.3%</span>
                        </div>
                        <div className="text-[gainsboro]">vs last month</div>
                      </div>
                    </div>
                    <div className="finances relative">
                    <TabsList className="absolute top-2 right-2 text-[grey] flex items-center justify-center w-[2em] h-[2em] border-[gainsboro] border-2 rounded-full p-1]">
                    <TabsTrigger value="expenses">
                    <div ><ArrowUpRight/></div>
                    </TabsTrigger>
                    </TabsList>
                      <h3 className="text-lg font-semibold mb-2">
                        Total Expenses
                      </h3>
                      <p className="text-2xl font-bold ">
                        ${totalExpenses.toFixed(2)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <div className="rates">
                          <span>
                            <ArrowUp className="w-[15px]" />
                          </span>
                          <span>2.4%</span>
                        </div>
                        <div className="text-[gainsboro]">vs last month</div>
                      </div>
                    </div>
                    <div className="finances relative">
                    <TabsList className="absolute top-2 right-2 text-[grey] flex items-center justify-center w-[2em] h-[2em] border-[gainsboro] border-2 rounded-full p-1]">
                    <TabsTrigger value="budget">
                    <div ><ArrowUpRight/></div>
                    </TabsTrigger>
                    </TabsList>
                      <h3 className="text-lg font-semibold mb-2">
                        Remaining Budget
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        ${remainingBudget.toFixed(2)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <div className="rate">
                          <span>
                            <ArrowUp className="w-[15px]" />
                          </span>
                          <span>2.7%</span>
                        </div>
                        <div className="text-[gainsboro]">vs last month</div>
                      </div>
                    </div>
                  </div>
                  {/* <div className='my-3 grid grid-cols-12 gap-4'>
                <div className="col-span-8 p-4 chart-graph">
                  <h3 className="text-lg font-semibold mb-2">Expense Trend</h3>
                  <div>
                  <Bar data={chartData} className='chart' />
                  </div>
                </div>

                <div className='col-span-4 p-4 budget'>
                  <h1>Budget</h1>
                  <ul>
                    <li>Cafe</li>
                    <li>Travelling</li>
                    <li>Entertainment</li>
                    <li>Health</li>
                  </ul>
                </div>
                </div> */}
                  <div className="my-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="chart-graph">
                      <h3 className="text-lg font-bold mb-2">Expense Trend</h3>
                      <Bar data={chartData} />
                    </div>
                    <div className="chart-graph">
                      <h1 className="text-lg font-bold mb-2">Goals</h1>
                      {goals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="mb-4">
                        <h4 className="font-semibold">{goal.name}</h4>
                        <Progress
                          value={(goal.currentAmount / goal.amount) * 100}
                          className="w-full h-4 mb-1"
                        />
                        <div className="flex justify-between text-sm">
                          <span>Current: ${goal.currentAmount.toFixed(2)}</span>
                          <span>Target: ${goal.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8 p-4 chart-graph">
                      <h3 className="text-lg font-semibold mb-2">
                        Recent transactions
                      </h3>
                      <div>
                        <div>
                          <table className="recent-t w-full text-left">
                            <thead>
                              <tr className="tr">
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Payment Info</th>
                                <th>Category</th>
                              </tr>
                            </thead>
                            <tbody>
  {expenses.length === 0 ? (
    <tr>
      <td colSpan="4" className="text-center py-4">
        No expenses added yet
      </td>
    </tr>
  ) : (
    expenses.slice(0, 5).map((expense) => {
      const date = new Date(expense.date.seconds * 1000);
      const formattedDate = date
        .toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(",", ""); // Remove comma from date string if present

      return (
        <tr key={expense.id} className="border-b">
          <td>{formattedDate}</td>
          <td>${expense.amount.toFixed(2)}</td>
          <td>{expense.paymentInfo}</td>
          <td>{expense.category}</td>
        </tr>
      );
    })
  )}
</tbody>

                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-4 p-4 budget">
                      <h1 className="text-lg font-bold mb-2">Budget Overview</h1>
                      {/* <ul>
                        <li>Cafe & Restaurants</li>
                        <li>Investment</li>
                        <li>Food & Groceries</li>
                        <li>Entertainment</li>
                        <li>Health & Beauty</li>
                        <li>Traveling</li>
                        <li>Other</li>
                      </ul> */}
                      <div className="mt-[-4.5em] mb-[-3em]">
          <BudgetDoughnutChart expenses={expenses} />
        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Tracker</CardTitle>
                  <CardDescription>Add and view your expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Transportation">
                            Transportation
                          </SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Entertainment">
                            Entertainment
                          </SelectItem>
                          <SelectItem value="Allowance">Allowance</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div> <Label htmlFor="paymentInfo">Payment Info</Label>
                      <Input
                        id="paymentInfo"
                        type="text"
                        value={paymentInfo}
                        onChange={(e) => setPaymentInfo(e.target.value)}
                        placeholder="Enter payment information"
                      /></div>
                    <div className="flex items-end">
                      <Button onClick={addExpense} className="w-full">
                        Add Expense
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Recent Expenses
                    </h3>
                    <div className="recent-expenses-container max-h-60 overflow-y-auto border rounded">
  <table className="recent-t w-full text-left">
    <thead>
      <tr className="tr">
        <th>Date</th>
        <th>Amount</th>
        <th>Payment Info</th>
        <th>Category</th>
      </tr>
    </thead>
    <tbody>
      {expenses.length === 0 ? (
        <tr>
          <td colSpan="4" className="text-center py-4">
            No expenses added yet
          </td>
        </tr>
      ) : (
        [...expenses].reverse().map((expense) => {
          const date = new Date(expense.date.seconds * 1000);
          const formattedDate = date
            .toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
            .replace(",", ""); // Remove comma from date string if present

          return (
            <tr key={expense.id} className="border-b">
              <td>{formattedDate}</td>
              <td>${expense.amount.toFixed(2)}</td>
              <td>{expense.paymentInfo}</td>
              <td>{expense.category}</td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>


                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Calculator</CardTitle>
                  <CardDescription>
                    Set and manage your monthly budget
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="income">Monthly Income</Label>
                      <Input
                        id="income"
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(parseFloat(e.target.value))}
                        placeholder="Enter your monthly income"
                        disabled={!isEditing} // Disable input unless editing
                      />
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Income
                      </Button>
                      <Button
                        onClick={handleSaveIncome}
                        className="btn btn-primary mt-2"
                      >
                        Save Income
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="budget">Monthly Budget</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(parseFloat(e.target.value))}
                        placeholder="Set your monthly budget"
                        disabled={!isEditingBudget} // Disable input unless editing
                      />
                      <Button onClick={() => setIsEditingBudget(true)}>
                        Edit Budget
                      </Button>
                      <Button onClick={handleSaveBudget}>Save Budget</Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Budget Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <Progress
                      value={(totalExpenses / budget) * 100}
                      className="w-full h-4"
                    />
                    <div className="flex justify-between mt-2">
                      <span>Spent: ${totalExpenses.toFixed(2)}</span>
                      <span>Remaining: ${remainingBudget.toFixed(2)}</span>
                    </div>
                    </div>
                    <div className="w-full h-100 mt-[-4em]">
          <BudgetDoughnutChart expenses={expenses} />
        </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Goals</CardTitle>
                  <CardDescription>
                    Set and track your financial goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Add Contribution
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="goal">Goal</Label>
                        <Select
                          onValueChange={setSelectedGoalId}
                          value={selectedGoalId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a goal" />
                          </SelectTrigger>
                          <SelectContent>
                            {goals.map((goal) => (
                              <SelectItem key={goal.id} value={goal.id}>
                                {goal.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contribution">
                          Contribution Amount
                        </Label>
                        <Input
                          id="contribution"
                          type="number"
                          value={contributionAmount}
                          onChange={(e) =>
                            setContributionAmount(e.target.value)
                          }
                          placeholder="Enter contribution amount"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addContribution} className="w-full">
                          Add Contribution
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="goalName">Goal Name</Label>
                      <Input
                        id="goalName"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        placeholder="Enter goal name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goalAmount">Target Amount</Label>
                      <Input
                        id="goalAmount"
                        type="number"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(e.target.value)}
                        placeholder="Enter target amount"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addGoal} className="w-full">
                        Add Goal
                      </Button>
                    </div>
                  </div>
                  <div>
  <h3 className="text-lg font-semibold mb-2">Your Goals</h3>
  {goals.length === 0 ? (
    <p className="text-center text-gray-500">No goals set yet</p>
  ) : (
    goals.map((goal) => (
      <div key={goal.id} className="mb-4">
        <h4 className="font-semibold">{goal.name}</h4>
        <Progress
          value={(goal.currentAmount / goal.amount) * 100}
          className="w-full h-4 mb-1"
        />
        <div className="flex justify-between text-sm">
          <span>Current: ${goal.currentAmount.toFixed(2)}</span>
          <span>Target: ${goal.amount.toFixed(2)}</span>
        </div>
      </div>
    ))
  )}
</div>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>
                    View your monthly and yearly financial reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold  mb-2">
                        Monthly Report
                      </h3>
                      <Bar data={chartData} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Yearly Overview
                      </h3>
                      <PieChart className="w-full h-64" />
                      <p className="text-center mt-2">
                        Yearly data visualization coming soon!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debt">
              <Card>
                <CardHeader>
                  <CardTitle>Debt Calculator</CardTitle>
                  <CardDescription>
                    Calculate how long it will take to pay off your debt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="debtAmount">Debt Amount</Label>
                      <Input
                        id="debtAmount"
                        type="number"
                        value={debtAmount}
                        onChange={(e) => setDebtAmount(e.target.value)}
                        placeholder="Enter debt amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="Enter interest rate"
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                      <Input
                        id="monthlyPayment"
                        type="number"
                        value={monthlyPayment}
                        onChange={(e) => setMonthlyPayment(e.target.value)}
                        placeholder="Enter monthly payment"
                      />
                    </div>
                  </div>
                  <Button onClick={calculateDebtPayoff} className="w-full">
                    Calculate
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
    </div>
  )
}

export default Pfm