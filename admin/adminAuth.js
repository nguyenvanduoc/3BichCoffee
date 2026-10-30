// Đăng nhập admin bằng Firebase Authentication.
// Quyền sửa dữ liệu được kiểm tra ở Firestore Security Rules (firestore.rules),
// nên sessionStorage ở các trang chỉ dùng để hiển thị tên, không dùng để cấp quyền.
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
    setPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from "../firebaseConfig.js";

export const auth = getAuth(app);
// Giữ đăng nhập trong tab hiện tại; đóng tab là phải đăng nhập lại (giống trước đây)
setPersistence(auth, browserSessionPersistence).catch(() => { });

const EMAIL_DOMAIN = "3bichcoffee.com";

// Cho phép gõ tên đăng nhập ngắn ("vanduoc") hoặc email đầy đủ
export const toEmail = (name) => name.includes('@') ? name.trim() : `${name.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
export const displayName = (user) => user?.displayName || (user?.email || '').split('@')[0] || 'Admin';

export async function adminSignIn(name, password) {
    const cred = await signInWithEmailAndPassword(auth, toEmail(name), password);
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('loggedInName', displayName(cred.user));
    return cred.user;
}

export async function adminSignOut() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('loggedInName');
    try { await signOut(auth); } catch (e) { /* bỏ qua */ }
}

// Dùng ở các trang quản trị: chưa đăng nhập Firebase thì về trang đăng nhập
export function requireAdmin(onReady) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('loggedInName');
            window.location.replace("Login.html");
            return;
        }
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loggedInName', displayName(user));
        if (onReady) onReady(user);
    });
}

export { onAuthStateChanged };
