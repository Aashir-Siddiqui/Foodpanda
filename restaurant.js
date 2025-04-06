import {auth } from "./firebase.js";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bGFlZ3FhdW54ZGN4aXdocGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzY3MzMsImV4cCI6MjA1OTQ1MjczM30.348sIaMgJYtjj6cLcnivey4QZg8CEeBT_Q02hQYm43c";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

auth.onAuthStateChanged(async (user) => {
    if (user) {
        const idToken = await user.getIdToken();
        await supabase.auth.setSession({ access_token: idToken });
    }
});

const showError = (title, text) => Swal.fire({ icon: "error", title, text });

const restaurantList = document.getElementById("restaurantList");
const loadRestaurants = async () => {
    try {
        const { data, error } = await supabase
            .from("restaurants")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        restaurantList.innerHTML = "";
        data.forEach((restaurant) => {
            const card = `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <img src="${restaurant.image_url}" class="card-img-top" alt="${restaurant.name}">
                        <div class="card-body">
                            <h5 class="card-title">${restaurant.name}</h5>
                            <p class="card-text">${restaurant.address}</p>
                        </div>
                    </div>
                </div>
            `;
            restaurantList.innerHTML += card;
        });
    } catch (error) {
        console.error("Error loading restaurants:", error);
        showError("Error", "Failed to load restaurants.");
    }
};

loadRestaurants();