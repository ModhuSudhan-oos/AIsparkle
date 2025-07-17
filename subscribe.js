// subscribe.js

document.addEventListener('DOMContentLoaded', () => {
    const subscribeForm = document.getElementById('subscribe-form');
    const subscribeEmailInput = document.getElementById('subscribe-email');
    const subscribeMessage = document.getElementById('subscribe-message');

    if (subscribeForm && typeof db !== 'undefined') { // Ensure db (Firestore) is initialized
        subscribeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = subscribeEmailInput.value.trim();

            if (!email) {
                subscribeMessage.textContent = 'Please enter a valid email address.';
                subscribeMessage.style.color = '#ef4444'; // Tailwind red-500
                return;
            }

            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                subscribeMessage.textContent = 'Please enter a valid email format (e.g., example@domain.com).';
                subscribeMessage.style.color = '#ef4444'; // Tailwind red-500
                return;
            }

            try {
                const subscribersRef = db.collection('subscribers');

                // Check for duplicate entry
                const querySnapshot = await subscribersRef.where('email', '==', email).get();

                if (!querySnapshot.empty) {
                    subscribeMessage.textContent = 'You are already subscribed!';
                    subscribeMessage.style.color = '#f59e0b'; // Tailwind amber-500
                    subscribeEmailInput.value = ''; // Clear the input
                    return;
                }

                // Add new subscriber
                await subscribersRef.add({
                    email: email,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                subscribeMessage.textContent = 'Thank you for subscribing! 🎉';
                subscribeMessage.style.color = '#22c55e'; // Tailwind green-500
                subscribeEmailInput.value = ''; // Clear the input
            } catch (error) {
                console.error("Error adding document: ", error);
                subscribeMessage.textContent = 'Failed to subscribe. Please try again. 😢';
                subscribeMessage.style.color = '#ef4444'; // Tailwind red-500
            }
        });
    } else {
        console.error("Subscribe form or Firebase Firestore 'db' object not found/initialized. Check firebase-config.js and its loading order.");
        if (subscribeMessage) {
            subscribeMessage.textContent = "Subscription service not available. Please check console for errors.";
            subscribeMessage.style.color = '#ef4444';
        }
    }
});
