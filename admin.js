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

document.getElementById("saveRestaurantBtn").addEventListener("click", async () => {
    console.log("Save Restaurant Button Clicked - Event Listener Triggered");

    const restaurantName = document.getElementById("restaurantName").value;
    const restaurantAddress = document.getElementById("restaurantAddress").value;
    const restaurantImage = document.getElementById("restaurantImage").files[0];

    console.log("Form Values:", { restaurantName, restaurantAddress, restaurantImage });

    if (!restaurantName || !restaurantAddress || !restaurantImage) {
        console.log("Validation Failed: Missing Fields");
        return showError("Missing Fields", "Please fill all fields including the image!");
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("Please log in as an admin to add a restaurant.");
        }
        console.log("Current User UID in admin.js:", user.id);

        const { data: userData, error: roleError } = await supabase
            .from("firebase_users")
            .select("role")
            .eq("uid", user.id)
            .single();

        console.log("Supabase Query Response:", { userData, roleError });

        if (roleError || !userData) {
            throw new Error("User role not found. Please sign up again.");
        }

        if (userData.role !== "admin") {
            throw new Error("Only admins can add restaurants.");
        }

        const timestamp = Date.now();
        const originalFileName = restaurantImage.name;
        const fileExtension = originalFileName.split('.').pop();
        const uniqueFileName = `${originalFileName.split('.')[0]}-${timestamp}.${fileExtension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("restaurants")
            .upload(`images/${uniqueFileName}`, restaurantImage, {
                upsert: true
            });

        if (uploadError) {
            throw new Error(uploadError.message);
        }
        console.log("Image Uploaded:", uploadData);

        const { data: urlData } = supabase.storage
            .from("restaurants")
            .getPublicUrl(`images/${uniqueFileName}`);

        const imageUrl = urlData.publicUrl;
        console.log("Image Public URL:", imageUrl);

        const restaurantData = {
            name: restaurantName,
            address: restaurantAddress,
            image_url: imageUrl,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from("restaurants")
            .insert([restaurantData]);

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

// Logout Logic
document.getElementById("logoutBtn").addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showError("Logout Error", error.message);
    } else {
        showSuccess("Logout", "You have been logged out.");
        window.location.href = "/index.html";
    }
});

// // Focus management for modal
// const modal = document.getElementById("exampleModal");
// const firstFocusableElement = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
// const lastFocusableElement = modal.querySelectorAll('input, button, select, textarea, [tabindex]:not([tabindex="-1"])')[modal.querySelectorAll('input, button, select, textarea, [tabindex]:not([tabindex="-1"])').length - 1];

// // When modal opens, trap focus inside modal
// modal.addEventListener('shown.bs.modal', () => {
//     console.log("Modal Shown - Focusing First Element");
//     if (firstFocusableElement) {
//         firstFocusableElement.focus();
//     }
//     // Ensure background content is not focusable
//     const backgroundElements = document.querySelectorAll('body > *:not(#exampleModal)');
//     backgroundElements.forEach(el => {
//         el.setAttribute('aria-hidden', 'true');
//         el.setAttribute('tabindex', '-1');
//     });
// });

// // Trap focus inside modal
// modal.addEventListener('keydown', (e) => {
//     if (e.key === 'Tab') {
//         if (e.shiftKey) { // Shift + Tab
//             if (document.activeElement === firstFocusableElement) {
//                 e.preventDefault();
//                 lastFocusableElement.focus();
//             }
//         } else { // Tab
//             if (document.activeElement === lastFocusableElement) {
//                 e.preventDefault();
//                 firstFocusableElement.focus();
//             }
//         }
//     }
// });

// // When modal closes, restore background content
// modal.addEventListener('hidden.bs.modal', () => {
//     console.log("Modal Hidden - Returning Focus to Open Button");
//     const backgroundElements = document.querySelectorAll('body > *:not(#exampleModal)');
//     backgroundElements.forEach(el => {
//         el.removeAttribute('aria-hidden');
//         el.removeAttribute('tabindex');
//     });
//     const openModalButton = document.querySelector('button[data-bs-target="#exampleModal"]');
//     if (openModalButton) {
//         openModalButton.focus();
//     }
// });

// // Manual close logic for Close buttons
// document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
//     button.addEventListener('click', () => {
//         console.log("Manual Close Triggered");
//         const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
//         modal.hide();
//     });
// });