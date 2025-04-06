import {onAuthStateChanged, signOut } from "./firebase.js";

const supabaseUrl = "https://bulaegqaunxdcxiwhphf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bGFlZ3FhdW54ZGN4aXdocGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzY3MzMsImV4cCI6MjA1OTQ1MjczM30.348sIaMgJYtjj6cLcnivey4QZg8CEeBT_Q02hQYm43c";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const idToken = await user.getIdToken();
        await supabase.auth.setSession({ access_token: idToken });
        console.log("Supabase session set with Firebase UID:", user.uid);
    } else {
        window.location.href = "/index.html";
    }
});

const showError = (title, text) => Swal.fire({ icon: "error", title, text });
const showSuccess = (title, text) => Swal.fire({ icon: "success", title, text });

document.getElementById("saveRestaurantBtn").addEventListener("click", async () => {
    console.log("Save Restaurant Button Clicked");

    const restaurantName = document.getElementById("restaurantName").value;
    const restaurantAddress = document.getElementById("restaurantAddress").value;
    const restaurantImage = document.getElementById("restaurantImage").files[0];

    if (!restaurantName || !restaurantAddress || !restaurantImage) {
        console.log("Validation Failed: Missing Fields");
        return showError("Missing Fields", "Please fill all fields including the image!");
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("Please log in as an admin to add a restaurant.");
        }
        console.log("Current User UID in admin.js:", user.uid);

        const { data: userData, error: roleError } = await supabase
            .from("firebase_users")
            .select("role")
            .eq("uid", user.uid)
            .single();

        console.log("Supabase Query Response:", { userData, roleError });

        if (roleError || !userData) {
            throw new Error("User role not found. Please sign up again.");
        }

        if (userData.role !== "admin") {
            throw new Error("Only admins can add restaurants.");
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("restaurants")
            .upload(`images/${restaurantImage.name}`, restaurantImage);

        if (uploadError) {
            throw new Error(uploadError.message);
        }
        console.log("Image Uploaded:", uploadData);

        const { data: urlData } = supabase.storage
            .from("restaurants")
            .getPublicUrl(`images/${restaurantImage.name}`);

        const imageUrl = urlData.publicUrl;
        console.log("Image Public URL:", imageUrl);

        const { data, error } = await supabase
            .from("restaurants")
            .insert([
                {
                    name: restaurantName,
                    address: restaurantAddress,
                    image_url: imageUrl,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            throw new Error(error.message);
        }
        console.log("Restaurant Inserted:", data);

        showSuccess("Success", "Restaurant added successfully!");
        document.getElementById("restaurantForm").reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
        modal.hide();
    } catch (error) {
        console.error("Error adding restaurant:", error);
        showError("Error", error.message);
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        showSuccess("Logout", "You have been logged out.");
        window.location.href = "/index.html";
    }).catch((error) => {
        showError("Logout Error", error.message);
    });
});