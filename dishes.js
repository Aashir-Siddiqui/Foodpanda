import { auth, onAuthStateChanged, signOut, db, collection, getDocs, query, orderBy, addDoc, updateDoc, where, doc } from './firebase.js';

const showError = (title, text) => Swal.fire({ icon: "error", title, text });
const showSuccess = (title, text) => Swal.fire({ icon: "success", title, text });

const loadDishes = async () => {
    const dishesShowList = document.getElementById("dishesShowList");
    if (!dishesShowList) {
        console.error("Dishes list not found!");
        showError("Error", "Page not loaded correctly. Please refresh.");
        return;
    }

    dishesShowList.innerHTML = '<p>Loading dishes...</p>';
    try {
        const q = query(collection(db, "dishes"), orderBy("created_at", "desc"));
        const querySnapshot = await getDocs(q);
        console.log("Fetched dishes count:", querySnapshot.size);

        dishesShowList.innerHTML = "";
        if (querySnapshot.empty) {
            dishesShowList.innerHTML = '<p>No dishes found.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const dish = doc.data();
            const dishId = doc.id;
            const card = `
                <div class="col-md-3 mb-3">
                    <div class="card user">
                        <div class="card-img-container">
                            <img src="${dish.image_url || 'https://dummyimage.com/400x400/000/fff.png&text=No+Image+Available'}" class="card-img-top" alt="${dish.name}" onerror="this.src='https://dummyimage.com/400x400/000/fff.png&text=Image+Not+Found'">
                            <div class="card-img-overlay user-only">
                                <button class="btn-user btn-heart" data-id="${dishId}"><i class="fa-regular fa-heart"></i></button>
                                <button class="btn-user btn-cart" data-id="${dishId}"><i class="fa-brands fa-opencart"></i></button>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${dish.name}</h5>
                            <p class="card-text"><strong>Price:</strong> PKR ${dish.price}</p>
                            <p class="card-text"><strong>Category:</strong> ${dish.category}</p>
                            <p class="card-text">${dish.description}</p>
                        </div>
                    </div>
                </div>
            `;
            dishesShowList.innerHTML += card;
        });

        document.querySelectorAll(".btn-heart").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const heartIcon = btn.querySelector("i");
                heartIcon.classList.toggle("fa-regular");
                heartIcon.classList.toggle("fa-solid");
            });
        });

        document.querySelectorAll(".btn-cart").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const dishId = e.target.closest(".btn-cart").dataset.id;
                try {
                    const cartRef = collection(db, `users/${auth.currentUser.uid}/cart`);
                    const q = query(cartRef, where("dishId", "==", dishId));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const cartDoc = querySnapshot.docs[0];
                        const currentQuantity = cartDoc.data().quantity || 1;
                        await updateDoc(doc(db, `users/${auth.currentUser.uid}/cart`, cartDoc.id), {
                            quantity: currentQuantity + 1,
                            added_at: new Date().toISOString()
                        });
                        showSuccess("Updated Cart", `Quantity of ${cartDoc.data().dishId} increased!`);
                    } else {
                        await addDoc(cartRef, {
                            dishId,
                            quantity: 1,
                            added_at: new Date().toISOString()
                        });
                        showSuccess("Added to Cart", `Dish ID ${dishId} added to your cart!`);
                    }
                } catch (error) {
                    console.error("Error adding to cart:", error);
                    showError("Error", `Failed to add to cart: ${error.message}`);
                }
            });
        });
    } catch (error) {
        console.error("Error loading dishes:", error);
        dishesShowList.innerHTML = "";
        if (error.code === "permission-denied") {
            showError("Access Denied", "You don't have permission to view dishes.");
        } else if (error.code === "unavailable") {
            showError("Network Error", "Failed to connect to the server.");
        } else {
            showError("Error", `Failed to load dishes: ${error.message}`);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log("No user logged in, redirecting to index.html");
            window.location.href = "/index.html";
        } else {
            console.log("User authenticated, UID:", user.uid);
            loadDishes();
        }
    });
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        showSuccess("Logout", "You have been logged out.").then((result) => {
            if (result.isConfirmed) {
                setTimeout(() => {
                    window.location.href = "/index.html";
                }, 1000);
            }
        })
    } catch (error) {
        console.error("Logout error:", error);
        showError("Logout Error", error.message);
    }
});