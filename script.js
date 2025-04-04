import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, doc, setDoc, getDoc } from "./firebase.js";

const showError = (title, text) => Swal.fire({ icon: "error", title, text });
const showSuccess = (title, text) => Swal.fire({ icon: "success", title, text });
const showWarning = (title, text) => Swal.fire({ icon: "warning", title, text });

document.querySelectorAll(".toggle-password").forEach(toggle => {
    toggle.addEventListener("click", () => {
        const passwordInput = toggle.previousElementSibling;
        const eyeIcon = toggle.querySelector(".eye-icon");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.src = "images/unvisible eye.png";
        } else {
            passwordInput.type = "password";
            eyeIcon.src = "images/visible eye.png";
        }
    });
});

let signupBtn = document.querySelector(".sign-up-btn");
let adminSignupBtn = document.getElementById("admin-signup-btn");
let loginBtn = document.querySelector(".log-in-btn");
let signupCont = document.getElementById("signup-container");
let loginCont = document.getElementById("login-container");
let body = document.querySelector("body");
let frontPage = document.querySelector(".FrontPage");

let currentRole = "user";

signupBtn.addEventListener("click", () => {
    signupCont.style.display = "block";
    loginCont.style.display = "none";
    body.style.overflowY = "hidden";
    frontPage.style.opacity = "0.5";
    frontPage.style.pointerEvents = "none";
    currentRole = "user";
    console.log("User Signup Clicked - Current Role:", currentRole);
    signupCont.querySelector("#su-email").value = "";
    signupCont.querySelector("#su-password").value = "";
});

adminSignupBtn.addEventListener("click", () => {
    signupCont.style.display = "block";
    loginCont.style.display = "none";
    body.style.overflowY = "hidden";
    frontPage.style.opacity = "0.5";
    frontPage.style.pointerEvents = "none";
    currentRole = "admin";
    console.log("Admin Signup Clicked - Current Role:", currentRole);
    signupCont.querySelector("#su-email").value = "";
    signupCont.querySelector("#su-password").value = "";
});

loginBtn.addEventListener("click", () => {
    loginCont.style.display = "block";
    signupCont.style.display = "none";
    body.style.overflowY = "hidden";
    frontPage.style.opacity = "0.5";
    frontPage.style.pointerEvents = "none";
    loginCont.querySelector("#li-email").value = "";
    loginCont.querySelector("#li-password").value = "";
});

document.querySelectorAll(".close-popup").forEach(closeBtn => {
    closeBtn.addEventListener("click", () => {
        const target = document.getElementById(closeBtn.dataset.target);
        target.style.display = "none";
        body.style.overflowY = "auto";
        frontPage.style.opacity = "1";
        frontPage.style.pointerEvents = "auto";
    });
});

document.querySelectorAll(".switch-form").forEach(switchLink => {
    switchLink.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(switchLink.dataset.target);
        signupCont.style.display = target.id === "signup-container" ? "block" : "none";
        loginCont.style.display = target.id === "login-container" ? "block" : "none";
        body.style.overflowY = "hidden";
        frontPage.style.opacity = "0.5";
        frontPage.style.pointerEvents = "none";
        currentRole = target.id === "signup-container" ? "user" : currentRole;
        console.log("Switch Form - Current Role:", currentRole);

        if (target.id === "signup-container") {
            const emailInput = target.querySelector("#su-email");
            const passwordInput = target.querySelector("#su-password");
            if (emailInput) emailInput.value = "";
            if (passwordInput) passwordInput.value = "";
        } else if (target.id === "login-container") {
            const emailInput = target.querySelector("#li-email");
            const passwordInput = target.querySelector("#li-password");
            if (emailInput) emailInput.value = "";
            if (passwordInput) passwordInput.value = "";
        }
    });
});

document.getElementById("signupBtn").addEventListener("click", () => {
    const email = signupCont.querySelector("#su-email");
    const password = signupCont.querySelector("#su-password");

    if (!email.value || !password.value) {
        return showError("Missing Fields", "Please enter email and password!");
    }

    if (password.value.length < 6) {
        return showError("Weak Password", `Password must be at least 6 characters long! Current length: ${password.value.length}`);
    }

    console.log("Signup Role:", currentRole);

    createUserWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            const user = userCredential.user;
            return setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: currentRole,
                createdAt: new Date().getTime()
            }).then(() => {
                showSuccess("Signup Successful", `Welcome, ${user.email}!`);
                return Swal.close();
            }).then(() => {
                showSuccess("Signup Successful", `Welcome, ${user.email}!`)
                    .then((result) => {
                        if (result.isConfirmed) {
                            setTimeout(() => {
                                signupCont.style.display = "none";
                                body.style.overflowY = "auto";
                                frontPage.style.opacity = "1";
                                frontPage.style.pointerEvents = "auto";
                                if (currentRole === "admin") {
                                    window.location.href = '/admin.html';
                                } else {
                                    window.location.href = '/restaurant.html';
                                }
                            }, 1000);
                        }
                    });
            });
        })
        .catch((error) => {
            showError("Signup Failed", error.message);
        });
});

document.getElementById("loginBtn").addEventListener("click", () => {
    const email = loginCont.querySelector("#li-email");
    const password = loginCont.querySelector("#li-password");

    if (!email.value || !password.value) {
        return showError("Missing Fields", "Please enter email and password!");
    }

    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User Logged In:", user.uid, user.email);
            return getDoc(doc(db, "users", user.uid)).then((docSnap) => {
                if (docSnap.exists()) {
                    const role = docSnap.data().role;
                    console.log("User Role from Firestore:", role);
                    showSuccess("Login Successful", `Welcome back, ${user.email}!`).then((result) => {
                        if (result.isConfirmed) {
                            setTimeout(() => {
                                loginCont.style.display = "none";
                                body.style.overflowY = "auto";
                                frontPage.style.opacity = "1";
                                frontPage.style.pointerEvents = "auto";
                                if (role === "admin") {
                                    window.location.href = '/admin.html';
                                } else if (role === "user") {
                                    window.location.href = '/restaurant.html';
                                } else {
                                    console.warn("Invalid role detected:", role);
                                    window.location.href = '/restaurant.html';
                                }
                            }, 1000);
                        }
                    });
                }
            });
        })
        .catch((error) => {
            console.error("Login Error:", error.code, error.message);
            showError("Login Failed", error.message);
        });
});
