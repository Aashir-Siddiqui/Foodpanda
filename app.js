
// Hiding Container-1
document.querySelector(".close-logo").addEventListener(("click"), () => {
    document.querySelector(".cont-1").style.display = "none"
    document.querySelector(".cont-2").style.top = "0"

})

// Auto Typing
new Typed("#autowriting", {
    strings: ["discounts on your first order!", "free delivery on your first order!"],
    typeSpeed: 100,
    backSpeed: 100,
    loop: true
})


// For Hiding And Showing Password
let spass=document.getElementById("s-pass")
let eye=document.getElementById("hidden-pass")
let visibleeye=document.getElementById("visible-eye") 
eye.addEventListener("click", () => {
    if (spass.type === "password") {
        spass.type = "text";
        visibleeye.src = "images/unvisible eye.png";
    } else {
        spass.type = "password";
        visibleeye.src = "images/visible eye.png";
    }
});


// For SignUp popUp
let signupbtn=document.querySelector(".sign-up-btn")
let SignupCont=document.getElementById("Signup-cont")
let body=document.querySelector("body")
let closePopup=document.getElementById("close-popup")
let FrontPage=document.querySelector(".FrontPage")
let loginbtn=document.querySelector(".log-in-btn")
signupbtn.addEventListener("click",()=>{
    SignupCont.style.visibility="visible"
    body.style.overflowY="hidden"
    FrontPage.style.opacity="0.3"
    
})
loginbtn.addEventListener("click",()=>{
    SignupCont.style.visibility="visible"
    body.style.overflowY="hidden"
    FrontPage.style.opacity="0.3"
})
closePopup.addEventListener("click",()=>{
    SignupCont.style.visibility="hidden"
    body.style.overflowY="scroll"
    FrontPage.style.opacity="1"
})


import{
    auth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut,
    provider,GoogleAuthProvider,signInWithPopup
} from "./firebase.js"

// SignUp
let signUp = () => {
    let email = document.getElementById("s-email").value
    let password = document.getElementById("s-pass").value
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user)
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
}

let signupEmailPassBtn=document.getElementById("signupByE&PBtn")
signupEmailPassBtn.addEventListener("click",signUp)

// // Login With Google
let googleLogin = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(user)
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.log("User Not Login ")
        });
}

let LoginGoogle=document.getElementById("LoginGoogle")
LoginGoogle.addEventListener("click",googleLogin)