// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVpddOtX1yRxslNxh8yz3SJq53eUYhkZ0",
  authDomain: "next-gen-186aa.firebaseapp.com",
  projectId: "next-gen-186aa",
  storageBucket: "next-gen-186aa.firebasestorage.app",
  messagingSenderId: "338569531164",
  appId: "1:338569531164:web:932df077b59a0a371b34d9",
  measurementId: "G-7GCT5KHFQ0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Data fetching functions
export const fetchTools = async () => {
  try {
    const snapshot = await database.ref('tools').once('value');
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching tools:", error);
    return null;
  }
};

export const fetchToolById = async (id) => {
  try {
    const snapshot = await database.ref(`tools/${id}`).once('value');
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching tool:", error);
    return null;
  }
};

export const fetchFeatures = async () => {
  try {
    const snapshot = await database.ref('features').once('value');
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching features:", error);
    return null;
  }
};

export const fetchFAQs = async () => {
  try {
    const snapshot = await database.ref('faqs').once('value');
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return null;
  }
};

export const fetchTestimonials = async () => {
  try {
    const snapshot = await database.ref('testimonials').once('value');
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return null;
  }
};

export const fetchAboutContent = async () => {
  try {
    const snapshot = await database.ref('about').once('value');
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching about content:", error);
    return null;
  }
};

export const submitContactForm = async (formData) => {
  try {
    await database.ref('contactSubmissions').push(formData);
    return true;
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return false;
  }
};
