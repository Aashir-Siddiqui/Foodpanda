const supabaseUrl = "https://bulaegqaunxdcxiwhphf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bGFlZ3FhdW54ZGN4aXdocGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzY3MzMsImV4cCI6MjA1OTQ1MjczM30.348sIaMgJYtjj6cLcnivey4QZg8CEeBT_Q02hQYm43c";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const showError = (title, text) => Swal.fire({ icon: "error", title, text });
const showSuccess = (title, text) => Swal.fire({ icon: "success", title, text });

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
    window.location.href = "/index.html";
} else {
    console.log("Supabase User Authenticated, UID:", user.id);
}

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
            console.log("Original Image URL:", restaurant.image_url);
            const imageUrl = restaurant.image_url || "https://dummyimage.com/400x400/000/fff.png&text=No+Image+Available";
            const card = `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <img src="${imageUrl}" class="card-img-top" id="restaurant-img" alt="${restaurant.name}" onerror="this.src='https://dummyimage.com/400x400/000/fff.png&text=Image+Not+Found'">
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

document.getElementById("logoutBtn").addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showError("Logout Error", error.message);
    } else {
        showSuccess("Logout", "You have been logged out.");
        window.location.href = "/index.html";
    }
});