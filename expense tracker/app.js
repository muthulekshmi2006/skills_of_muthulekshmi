// ---------------- IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    push,
    onValue
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
    apiKey: "AIzaSyC2gqLeQry_1-2v6XZJOk0DkLTf8LAcpng",
    authDomain: "expense-tracker-for-students.firebaseapp.com",
    databaseURL: "https://expense-tracker-for-students-default-rtdb.firebaseio.com",
    projectId: "expense-tracker-for-students",
    storageBucket: "expense-tracker-for-students.appspot.com",
    messagingSenderId: "406950436917",
    appId: "1:406950436917:web:8117ecfd6ad7b2519f917c"
};

// ---------------- INITIALIZE ----------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ---------------- AUTH STATE HANDLER ----------------
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById("loginSection");
    const expenseSection = document.getElementById("expenseSection");

    if (!loginSection || !expenseSection) return;

    if (user) {
        loginSection.style.display = "none";
        expenseSection.style.display = "block";
        loadExpenses();
    } else {
        loginSection.style.display = "block";
        expenseSection.style.display = "none";
    }
});

// ---------------- SIGN UP ----------------
window.signup = function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Enter email and password");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => alert("Signup successful"))
        .catch(err => alert(err.message));
};

// ---------------- LOGIN ----------------
window.login = function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Enter email and password");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .catch(err => alert(err.message));
};

// ---------------- LOGOUT ----------------
window.logout = function () {
    signOut(auth).then(() => {
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

        document.getElementById("loginSection").style.display = "block";
        document.getElementById("expenseSection").style.display = "none";
    });
};

// ---------------- ADD EXPENSE ----------------
window.addExpense = function () {
    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const user = auth.currentUser;

    if (!title || !amount) {
        alert("Enter all fields");
        return;
    }
    if (!user) return;

    push(ref(db, "expenses/" + user.uid), {
        title: title,
        amount: Number(amount),
        createdAt: Date.now()
    });

    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
};

// ---------------- LOAD EXPENSES + TOTAL ----------------
function loadExpenses() {
    const user = auth.currentUser;
    if (!user) return;

    const expenseRef = ref(db, "expenses/" + user.uid);

    onValue(expenseRef, (snapshot) => {
        const list = document.getElementById("expenseList");
        const totalEl = document.getElementById("totalExpense");

        list.innerHTML = "";
        let total = 0;

        snapshot.forEach(child => {
            const data = child.val();
            total += Number(data.amount);

            const li = document.createElement("li");
            const date = new Date(data.createdAt);
            li.textContent =
                `${data.title} - ₹${data.amount} (${date.toLocaleDateString()} ${date.toLocaleTimeString()})`;

            list.appendChild(li);
        });

        totalEl.textContent = `Total: ₹${total}`;
    });
}
