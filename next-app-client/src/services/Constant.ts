// export const API_URL = "http://localhost:3333/api";
// export const URL_IMAGE = "http://localhost:3333";
// export const API_URL = "https://big-whole-camel.ngrok-free.app/api";
// export const API_URL = "http://localhost:3333/api";
// export const API_URL = "http://188.166.222.86:3333/api";
// export const URL_IMAGE = "https://res.cloudinary.com";

// // Production - API chạy trên server remote
// // export const API_URL = "http://188.166.222.86:3333/api";
// // export const API_URL = "http://localhost:3333/api";

// export const URL_PPYTHON = "http://188.166.222.86:5001";  // ← API Gemini trên server (phải dùng IP thực, không dùng localhost trong Docker)
// export const URL_PPYTHON = "http://localhost:5001";  // ← API Gemini trên server (phải dùng IP thực, không dùng localhost trong Docker)

// export const API_URL = "http://138.68.234.160:3333/api";
// export const API_URL = "https://rentalroom-51g4.onrender.com/api";
// export const URL_IMAGE = "https://rentalroom-51g4.onrender.com";
// export const URL_PPYTHON = "https://ants-chatbot.onrender.com"

// Cấu hình linh hoạt: Lấy từ Environment Variables, nếu không có thì lấy mặc định (local)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://188.166.222.86:3333/api";
export const URL_IMAGE = "https://res.cloudinary.com";

// Chatbot Python (Gemini)
export const URL_PPYTHON = process.env.NEXT_PUBLIC_URL_PPYTHON || "http://188.166.222.86:5001";