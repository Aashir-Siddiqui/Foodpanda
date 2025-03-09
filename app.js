// Hiding Container-1
document.querySelector(".close-logo").addEventListener(("click"), () => {
    document.querySelector(".cont-1").style.display = "none"
    document.querySelector(".cont-2").style.margin = "0px"

})

// Auto Typing
new Typed("#autowriting", {
    strings: ["discounts on your first order!!", "free Delivery on your first order!!"],
    typeSpeed: 100,
    backSpeed: 100,
    loop: true
})
