// Firebase config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAb_m482WMnJHkGwVEWhoedv9FoBT9Ooik",
  authDomain: "reminder-1f76b.firebaseapp.com",
  projectId: "reminder-1f76b",
  storageBucket: "reminder-1f76b.firebasestorage.app",
  messagingSenderId: "314366128567",
  appId: "1:314366128567:web:de0d852fbf476ed47bb832",
  measurementId: "G-8JV11F20SM"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let editId = null;

function login() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      sessionStorage.setItem('loginTime', Date.now());
      showApp();
    }).catch(err => alert("Login Failed: " + err.message));
}

function logout() {
  auth.signOut().then(() => {
    sessionStorage.removeItem('loginTime');
    showLogin();
  });
}

auth.onAuthStateChanged(user => {
  const loginTime = sessionStorage.getItem('loginTime');
  if (user && loginTime && (Date.now() - loginTime < 15 * 60 * 1000)) {
    showApp();
  } else {
    auth.signOut();
    showLogin();
  }
});

function showLogin() {
  document.getElementById('loginForm').style.display = "block";
  document.getElementById('logoutBtn').style.display = "none";
  document.getElementById('reminderForm').style.display = "none";
  document.getElementById('search').style.display = "none";
  document.getElementById('reminderTableSection').style.display = "none";
}

function showApp() {
  document.getElementById('loginForm').style.display = "none";
  document.getElementById('logoutBtn').style.display = "inline-block";
  document.getElementById('reminderForm').style.display = "block";
  document.getElementById('search').style.display = "block";
  document.getElementById('reminderTableSection').style.display = "block";
  loadReminders();
}

function saveReminder() {
  const title = document.getElementById('title').value.trim();
  const reminderDate = document.getElementById('reminderDate').value;
  const dueDate = document.getElementById('dueDate').value;
  const mailTo = document.getElementById('mailTo').value.trim();
  const mailCc = document.getElementById('mailCc').value.trim();
  const details = document.getElementById('details').value.trim();

  if (!title || !reminderDate || !dueDate || !mailTo || !details) {
    alert("Please fill all required fields.");
    return;
  }

  const data = { title, reminderDate, dueDate, mailTo, mailCc, details, createdAt: new Date() };

  if (editId) {
    db.collection("reminders").doc(editId).update(data).then(() => {
      resetForm();
      loadReminders();
    });
  } else {
    db.collection("reminders").add(data).then(() => {
      resetForm();
      loadReminders();
    });
  }
}

function resetForm() {
  editId = null;
  document.getElementById('reminderForm').reset();
}

function loadReminders() {
  db.collection("reminders").orderBy("createdAt", "desc").get().then(snapshot => {
    const tbody = document.getElementById('reminderList');
    tbody.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.title}</td>
        <td>${data.reminderDate}</td>
        <td>${data.dueDate}</td>
        <td>${data.mailTo}</td>
        <td>${data.mailCc}</td>
        <td>${data.details}</td>
        <td>
          <button onclick="editReminder('${doc.id}')">Edit</button>
          <button onclick="deleteReminder('${doc.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });
}

function editReminder(id) {
  db.collection("reminders").doc(id).get().then(doc => {
    const data = doc.data();
    document.getElementById('title').value = data.title;
    document.getElementById('reminderDate').value = data.reminderDate;
    document.getElementById('dueDate').value = data.dueDate;
    document.getElementById('mailTo').value = data.mailTo;
    document.getElementById('mailCc').value = data.mailCc;
    document.getElementById('details').value = data.details;
    editId = id;
    window.scrollTo(0, 0);
  });
}

function deleteReminder(id) {
  if (confirm("Delete this reminder?")) {
    db.collection("reminders").doc(id).delete().then(() => {
      loadReminders();
    });
  }
}

function searchReminders() {
  const filter = document.getElementById('search').value.toLowerCase();
  const rows = document.querySelectorAll("#reminderList tr");
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
}
