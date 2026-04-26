import { collection, onSnapshot, doc, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

// State lưu trữ dữ liệu tải từ Firebase
window.coffeesData = [];
window.categoriesData = [];
let currentFilterCategory = "Tất cả";

// 1. TẢI DANH MỤC TỪ FIREBASE
onSnapshot(collection(db, "categories"), (snapshot) => {
    window.categoriesData = [];
    snapshot.forEach(doc => window.categoriesData.push({ id: doc.id, ...doc.data() }));
    window.categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0));
    renderFilters();
});

// 2. TẢI SẢN PHẨM TỪ FIREBASE
onSnapshot(collection(db, "products"), (snapshot) => {
    window.coffeesData = [];
    snapshot.forEach(doc => window.coffeesData.push({ id: doc.id, ...doc.data() }));
    renderSanPhams();

    // Xử lý link trực tiếp vào chi tiết sản phẩm qua URL parameter
    if (!window.initialProductChecked) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            window.xemChiTiet(id, false);
            history.replaceState({ view: 'detail', productId: id }, '', '?id=' + id);
        }
        window.initialProductChecked = true;
    }
});

// 3. TẢI CẤU HÌNH GIỚI THIỆU TỪ FIREBASE (CẬP NHẬT FOOTER)
onSnapshot(doc(db, "settings", "introduce"), (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        const desc = data.description || "";
        const contact = data.contact || "";

        const footerDesc = document.getElementById('footer-desc');
        const footerZalo = document.getElementById('footer-zalo');
        const modalZalo = document.getElementById('modal-zalo');
        const modalPhone = document.getElementById('modal-phone');

        if (footerDesc && desc) {
            footerDesc.innerHTML = `${desc.replace(/\n/g, '<br/>')}<br/><br/>Liên hệ: ${contact || ''}`;
        }

        if (contact) {
            const cleanPhone = contact.replace(/\D/g, '');
            if (cleanPhone) {
                if (footerZalo) footerZalo.href = `https://id.zalo.me/${cleanPhone}`;
                if (modalZalo) modalZalo.href = `https://id.zalo.me/${cleanPhone}`;
                if (modalPhone) modalPhone.href = `tel:${cleanPhone}`;
            }
        }
    }
});

// Hàm Format Tiền
window.formatVND = function (amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm tạo HTML thẻ sản phẩm
window.taoTheSanPham = function (coffee) {
    const badgeFeatured = coffee.featured ? `<div class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Nổi Bật</div>` : '';
    const badgeSale = coffee.discountPrice ? `<div class="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Sale</div>` : '';
    return `
        <div class="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer" onclick="xemChiTiet('${coffee.id}')">
            <div class="relative h-56 overflow-hidden img-placeholder">
                <img src="${coffee.image}" alt="${coffee.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/400x400?text=3BichCoffee'">
                ${badgeFeatured}
                ${badgeSale}
            </div>
            <div class="p-5 flex flex-col h-[calc(100%-14rem)]">
                <div class="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-1">${coffee.category}</div>
                <h3 class="text-xl font-bold text-coffee-900 mb-2 line-clamp-2">${coffee.name}</h3>
                <div class="mt-auto flex justify-between items-center pt-4">
                    <div>
                        ${coffee.discountPrice
            ? `<span class="text-lg font-black text-red-600">${window.formatVND(coffee.discountPrice)}</span> <span class="text-sm font-medium text-gray-400 line-through ml-1">${window.formatVND(coffee.price)}</span>`
            : `<span class="text-lg font-black text-coffee-600">${window.formatVND(coffee.price)}</span>`}
                    </div>
                    <button class="w-10 h-10 rounded-full bg-coffee-100 text-coffee-700 flex items-center justify-center group-hover:bg-coffee-600 group-hover:text-white transition-colors">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Render thanh lọc Menu
window.renderFilters = function () {
    const filterContainer = document.getElementById('category-filters');
    if (!filterContainer) return;

    const isAllActive = currentFilterCategory === "Tất cả";
    let html = `<button onclick="filterCoffees('Tất cả', this)" class="filter-btn px-6 py-2 ${isAllActive ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-700 hover:bg-coffee-100'} rounded-full font-medium shadow-sm transition-colors">Tất cả</button>`;

    window.categoriesData.forEach(cat => {
        const isActive = currentFilterCategory === cat.name;
        const btnClass = isActive
            ? "filter-btn px-6 py-2 bg-coffee-600 text-white rounded-full font-medium shadow-sm transition-colors"
            : "filter-btn px-6 py-2 bg-white text-coffee-700 hover:bg-coffee-100 rounded-full font-medium shadow-sm transition-colors";

        html += `<button onclick="filterCoffees('${cat.name}', this)" class="${btnClass}">${cat.name}</button>`;
    });

    filterContainer.innerHTML = html;
};

// Hành động Click Lọc Menu
window.filterCoffees = function (categoryName, btnElement) {
    currentFilterCategory = categoryName;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.className = 'filter-btn px-6 py-2 bg-white text-coffee-700 hover:bg-coffee-100 rounded-full font-medium shadow-sm transition-colors');
    if (btnElement) btnElement.className = 'filter-btn px-6 py-2 bg-coffee-600 text-white rounded-full font-medium shadow-sm transition-colors';

    renderListOnly();
};

// Render lại toàn bộ sản phẩm
window.renderSanPhams = function () {
    const featuredGrid = document.getElementById('featured-grid');
    if (featuredGrid && window.coffeesData.length > 0) {
        const featuredCoffees = window.coffeesData.filter(c => c.featured);
        featuredGrid.innerHTML = featuredCoffees.length > 0
            ? featuredCoffees.map(window.taoTheSanPham).join('')
            : `<p class="col-span-full text-center text-coffee-500 italic">Hiện chưa có món nổi bật nào.</p>`;
    }
    renderListOnly();
};

// Render theo danh mục đang chọn
function renderListOnly() {
    const allCoffeesGrid = document.getElementById('all-coffees-grid');
    if (!allCoffeesGrid) return;

    if (window.coffeesData.length === 0) {
        allCoffeesGrid.innerHTML = `<p class="col-span-full text-center text-coffee-400 italic">Chưa có sản phẩm nào trên hệ thống.</p>`;
        return;
    }

    if (currentFilterCategory === "Tất cả") {
        allCoffeesGrid.innerHTML = window.coffeesData.map(window.taoTheSanPham).join('');
    } else {
        const filtered = window.coffeesData.filter(c => c.category === currentFilterCategory);
        allCoffeesGrid.innerHTML = filtered.length > 0
            ? filtered.map(window.taoTheSanPham).join('')
            : `<p class="col-span-full text-center text-coffee-400 italic">Không có món nào trong nhóm này.</p>`;
    }
}

// Xem chi tiết
window.xemChiTiet = function (coffeeId, addToHistory = true) {
    const coffee = window.coffeesData.find(c => c.id === coffeeId);
    if (!coffee) return;

    document.getElementById('detail-img').src = coffee.image;
    document.getElementById('detail-category').textContent = coffee.category;
    document.getElementById('detail-title').textContent = coffee.name;
    document.getElementById('detail-price').innerHTML = coffee.discountPrice
        ? `<span class="text-red-600">${window.formatVND(coffee.discountPrice)}</span> <span class="text-lg text-gray-400 line-through ml-2">${window.formatVND(coffee.price)}</span>`
        : window.formatVND(coffee.price);
    document.getElementById('detail-desc').textContent = coffee.desc || "Hương vị hấp dẫn, đánh thức mọi giác quan.";

    // Kiểm tra nếu có mảng ingredients thì render, không thì ẩn toàn bộ khung thành phần
    const ingredients = coffee.ingredients || [];
    const ingredientsSection = document.getElementById('ingredients-section');

    if (ingredients.length > 0) {
        document.getElementById('detail-ingredients').innerHTML = ingredients.map(ing => `<li>${ing}</li>`).join('');
        if (ingredientsSection) ingredientsSection.classList.remove('hidden');
    } else {
        if (ingredientsSection) ingredientsSection.classList.add('hidden');
    }

    window.navigate('detail', addToHistory, coffeeId);
};

// --- CÁC HÀM UI ---
window.navigate = function (viewId, addToHistory = true, productId = null) {
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) activeView.classList.add('active');
    else { document.getElementById('view-index').classList.add('active'); viewId = 'index'; }

    if (addToHistory) {
        let url = window.location.pathname;
        if (viewId === 'detail' && productId) {
            url += '?id=' + productId;
        } else if (viewId !== 'index') {
            url += '?view=' + viewId;
        }
        history.pushState({ view: viewId, productId }, '', url);
    }
    window.scrollTo(0, 0);
};

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.view) {
        if (event.state.view === 'detail' && event.state.productId) {
            window.xemChiTiet(event.state.productId, false);
        } else {
            window.navigate(event.state.view, false);
        }
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        const view = urlParams.get('view');

        if (id) {
            if (window.coffeesData && window.coffeesData.length > 0) {
                window.xemChiTiet(id, false);
            }
        } else if (view === 'list') {
            window.navigate('list', false);
        } else {
            window.navigate('index', false);
        }
    }
});

window.toggleMobileMenu = function () {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
};

window.openOrderModal = () => { document.getElementById('order-modal').classList.remove('hidden'); document.getElementById('order-modal').classList.add('flex'); };
window.closeOrderModal = () => { document.getElementById('order-modal').classList.add('hidden'); document.getElementById('order-modal').classList.remove('flex'); };

// Khởi tạo
const urlParams = new URLSearchParams(window.location.search);
const initialId = urlParams.get('id');
const initialView = urlParams.get('view');
const legacyHash = window.location.hash.replace('#', '');

if (initialId) {
    // Được xử lý trong onSnapshot khi data load xong
} else if (initialView === 'list' || legacyHash === 'list') {
    window.navigate('list', false);
    history.replaceState({ view: 'list' }, '', '?view=list');
} else {
    window.navigate('index', false);
    history.replaceState({ view: 'index' }, '', window.location.pathname);
}

// --- CHATBOT WIDGET LOGIC ---
let isChatbotOpen = false;

window.toggleChatbot = function () {
    const windowEl = document.getElementById('chatbot-window');
    const msgIcon = document.getElementById('chatbot-icon-msg');
    const closeIcon = document.getElementById('chatbot-icon-close');
    const badge = document.getElementById('chatbot-badge');

    isChatbotOpen = !isChatbotOpen;

    if (isChatbotOpen) {
        windowEl.classList.remove('hidden');
        windowEl.classList.add('flex');
        msgIcon.classList.add('opacity-0', 'scale-50');
        closeIcon.classList.remove('opacity-0', 'scale-50');
        if (badge) badge.classList.add('hidden'); // Hide badge when opened
    } else {
        windowEl.classList.add('hidden');
        windowEl.classList.remove('flex');
        msgIcon.classList.remove('opacity-0', 'scale-50');
        closeIcon.classList.add('opacity-0', 'scale-50');
    }
};

window.sendChatMessage = function () {
    const inputEl = document.getElementById('chatbot-input');
    const message = inputEl.value.trim();
    if (!message) return;

    // Hiển thị tin nhắn của người dùng
    appendMessage(message, 'user');
    inputEl.value = '';

    // Scroll to bottom
    const messagesEl = document.getElementById('chatbot-messages');
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Giả lập bot gõ phím
    setTimeout(() => {
        botReply(message);
    }, 600);
};

function appendMessage(text, sender) {
    const messagesEl = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start mb-3 ' + (sender === 'user' ? 'justify-end' : '');

    if (sender === 'user') {
        msgDiv.innerHTML = `
            <div class="bg-coffee-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] text-sm">
                ${text}
            </div>
        `;
    } else {
        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-coffee-600 text-white flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <i class="fa-solid fa-robot text-xs"></i>
            </div>
            <div class="bg-white text-coffee-800 p-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] text-sm leading-relaxed">
                ${text}
            </div>
        `;
    }

    messagesEl.appendChild(msgDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function botReply(userMsg) {
    const lowerMsg = userMsg.toLowerCase();
    let reply = "Xin lỗi, mình là Trợ lý AI đang trong giai đoạn học hỏi nên chưa hiểu rõ ý bạn. Bạn có thể liên hệ Zalo 0399.232.692 để được hỗ trợ tốt nhất nhé!";

    if (lowerMsg.includes("chào") || lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
        reply = "Chào bạn! Mình có thể giúp gì cho bạn hôm nay?";
    } else if (lowerMsg.includes("giá") || lowerMsg.includes("bao nhiêu")) {
        reply = "Giá các món bên mình dao động từ 15k đến 50k tùy loại. Bạn có thể vào mục <b>Thực Đơn</b> để xem chi tiết nhé!";
    } else if (lowerMsg.includes("menu") || lowerMsg.includes("thực đơn") || lowerMsg.includes("có món gì")) {
        reply = "Bên mình chuyên cà phê mộc, cà phê sữa, trà sữa, trà trái cây và nhiều món khác. Bạn có thể nhấn vào mục Thực Đơn để xem chi tiết nhé!";
    } else if (lowerMsg.includes("địa chỉ") || lowerMsg.includes("ở đâu") || lowerMsg.includes("quán")) {
        reply = "Quán hiện đang giao hàng tận nơi tại khu vực Ninh Phước, Ninh Thuận. Bạn có muốn đặt món không ạ?";
    } else if (lowerMsg.includes("liên hệ") || lowerMsg.includes("sđt") || lowerMsg.includes("số điện thoại") || lowerMsg.includes("zalo")) {
        reply = "Bạn có thể liên hệ trực tiếp qua số điện thoại hoặc Zalo: <b>0399.232.692</b> nha!";
    }

    appendMessage(reply, 'bot');
}

// --- ANALYTICS TRACKING ---
async function trackVisitorSession() {
    try {
        // 1. Lấy IP (Sử dụng ipify)
        let ip = "Unknown";
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            ip = data.ip;
        } catch (err) { console.log("Không lấy được IP"); }

        // 2. Phân tích Thiết bị & Trình duyệt
        const ua = navigator.userAgent;
        let device = "Desktop";
        if (/Mobi|Android/i.test(ua)) device = "Mobile";
        else if (/Tablet|iPad/i.test(ua)) device = "Tablet";

        let browser = "Other";
        if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Edg")) browser = "Edge";

        // 3. Tạo session trên Firestore
        const sessionData = {
            ip: ip,
            device: device,
            browser: browser,
            startTime: serverTimestamp(),
            date: new Date().toISOString().split('T')[0],
            duration: 0,
            userAgent: ua
        };

        const docRef = await addDoc(collection(db, "visitor_sessions"), sessionData);
        const sessionId = docRef.id;
        const startTime = Date.now();

        // 4. Cập nhật thời gian ở lại (Cập nhật mỗi 20 giây để đảm bảo chính xác)
        setInterval(() => {
            const duration = Math.round((Date.now() - startTime) / 1000);
            updateDoc(doc(db, "visitor_sessions", sessionId), {
                duration: duration,
                lastActive: serverTimestamp()
            });
        }, 20000);

        // Cập nhật khi đóng trang
        window.addEventListener('beforeunload', () => {
            const duration = Math.round((Date.now() - startTime) / 1000);
            updateDoc(doc(db, "visitor_sessions", sessionId), {
                duration: duration,
                endTime: serverTimestamp()
            });
        });

    } catch (error) {
        console.error("Lỗi tracking:", error);
    }
}

// Chạy tracking khi load trang
trackVisitorSession();