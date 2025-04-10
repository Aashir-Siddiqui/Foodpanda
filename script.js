const supabaseUrl = "https://bulaegqaunxdcxiwhphf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bGFlZ3FhdW54ZGN4aXdocGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzY3MzMsImV4cCI6MjA1OTQ1MjczM30.348sIaMgJYtjj6cLcnivey4QZg8CEeBT_Q02hQYm43c";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const showError = (title, text) => Swal.fire({ icon: "error", title, text });
const showSuccess = (title, text) => Swal.fire({ icon: "success", title, text });
const showWarning = (title, text) => Swal.fire({ icon: "warning", title, text });

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

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

document.getElementById("signupBtn").addEventListener("click", async () => {
    const email = signupCont.querySelector("#su-email").value;
    const password = signupCont.querySelector("#su-password").value;

    if (!email || !password) {
        return showError("Missing Fields", "Please enter email and password!");
    }

    if (!validateEmail(email)) {
        return showError("Invalid Email", "Please enter a valid email address!");
    }

    if (password.length < 6) {
        return showError("Weak Password", `Password must be at least 6 characters long! Current length: ${password.length}`);
    }

    console.log("Signup Role:", currentRole);

    try {
        const { data: userData, error: signupError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        if (signupError) {
            throw new Error("Supabase Signup Error: " + signupError.message);
        }
        const user = userData.user;
        console.log("Supabase Signup Successful, UID:", user.id);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            throw new Error("Supabase Session Error: " + (sessionError?.message || "Session not found"));
        }
        console.log("Supabase Session Set:", sessionData.session.user.id);

        const { data, error } = await supabase
            .from("firebase_users")
            .insert([
                {
                    uid: user.id,
                    role: currentRole,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            throw new Error("Supabase Insert Error: " + error.message);
        }
        console.log("Supabase Insert Response:", { data, error });

        showSuccess("Signup Successful", `Welcome, ${user.email}!`).then((result) => {
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
    } catch (error) {
        console.error("Signup Error:", error);
        showError("Signup Failed", error.message);
    }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = loginCont.querySelector("#li-email").value;
    const password = loginCont.querySelector("#li-password").value;

    if (!email || !password) {
        return showError("Missing Fields", "Please enter email and password!");
    }

    if (!validateEmail(email)) {
        return showError("Invalid Email", "Please enter a valid email address!");
    }

    try {
        const { data: userData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (loginError) {
            throw new Error("Supabase Login Error: " + loginError.message);
        }
        const user = userData.user;
        console.log("Supabase Login Successful, UID:", user.id);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            throw new Error("Supabase Session Error: " + (sessionError?.message || "Session not found"));
        }
        console.log("Supabase Session Set:", sessionData.session.user.id);

        const { data: userRoleData, error: roleError } = await supabase
            .from("firebase_users")
            .select("role")
            .eq("uid", user.id)
            .single();

        if (roleError || !userRoleData) {
            throw new Error("User role not found in Supabase. Please sign up again.");
        }
        const role = userRoleData.role;
        console.log("Supabase Role:", role);

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
    } catch (error) {
        console.error("Login Error:", error);
        showError("Login Failed", error.message);
    }
});