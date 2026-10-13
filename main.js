import { collection, onSnapshot, doc, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

// State lưu trữ dữ liệu tải từ Firebase
window.coffeesData = [];
window.categoriesData = [];

// 1. TẢI DANH MỤC TỪ FIREBASE
onSnapshot(collection(db, "categories"), (snapshot) => {
    window.categoriesData = [];
    snapshot.forEach(doc => window.categoriesData.push({ id: doc.id, ...doc.data() }));
    window.categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0));
    window.renderMenu();
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
        window.shopAddresses = (data.address || "").split('\n').map(a => a.trim()).filter(Boolean);
        const addressHtml = window.shopAddresses.map(a => `Địa chỉ: ${a}<br/>`).join('');

        const footerDesc = document.getElementById('footer-desc');
        const footerZalo = document.getElementById('footer-zalo');
        const modalZalo = document.getElementById('modal-zalo');
        const modalPhone = document.getElementById('modal-phone');

        if (footerDesc && desc) {
            footerDesc.innerHTML = `${desc.replace(/\n/g, '<br/>')}<br/><br/>${addressHtml}Liên hệ: ${contact || ''}`;
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

// Khối giá: giá khuyến mãi (nếu có) + giá gốc gạch ngang
function khoiGia(coffee, size = 'sm') {
    const main = size === 'sm' ? 'text-sm sm:text-base' : 'text-base sm:text-lg';
    return coffee.discountPrice
        ? `<span class="${main} font-bold text-red-600">${window.formatVND(coffee.discountPrice)}</span> <span class="text-xs text-gray-400 line-through">${window.formatVND(coffee.price)}</span>`
        : `<span class="${main} font-bold text-coffee-900">${window.formatVND(coffee.price)}</span>`;
}

const ANH_LOI = "this.src='https://placehold.co/300x400?text=3BichCoffee'";

// Thẻ món nổi bật (hàng vuốt ngang)
window.taoTheSanPham = function (coffee) {
    const badgeSale = coffee.discountPrice ? `<div class="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">Sale</div>` : '';
    return `
        <div class="snap-start shrink-0 w-[42%] sm:w-52 lg:w-60 flex flex-col cursor-pointer group" onclick="xemChiTiet('${coffee.id}')">
            <div class="relative aspect-[3/4] rounded-2xl overflow-hidden bg-coffee-100">
                <img src="${coffee.image}" alt="${coffee.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="${ANH_LOI}">
                ${badgeSale}
            </div>
            <h3 class="mt-3 text-sm sm:text-base font-semibold text-coffee-900 leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">${coffee.name}</h3>
            <div class="mt-1">${khoiGia(coffee)}</div>
            <button class="mt-2 w-full py-2 rounded-xl bg-accent-50 text-accent-600 group-hover:bg-accent-500 group-hover:text-white font-bold text-sm uppercase tracking-wide transition-colors">Chọn</button>
        </div>
    `;
};

// Dòng món trong thực đơn (ảnh trái, tên + giá phải)
function taoDongMenu(coffee) {
    return `
        <div class="flex gap-3 p-2 sm:p-3 bg-white border border-coffee-100 rounded-2xl cursor-pointer hover:shadow-md transition-shadow group" onclick="xemChiTiet('${coffee.id}')">
            <div class="relative w-20 sm:w-24 aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-coffee-100">
                <img src="${coffee.image}" alt="${coffee.name}" loading="lazy" class="w-full h-full object-cover" onerror="${ANH_LOI}">
            </div>
            <div class="flex-1 min-w-0 flex flex-col py-1">
                <h4 class="font-semibold text-coffee-900 text-sm sm:text-base leading-snug line-clamp-2">${coffee.name}</h4>
                ${coffee.desc ? `<p class="hidden sm:block text-xs text-coffee-400 mt-1 line-clamp-2">${coffee.desc}</p>` : ''}
                <div class="mt-auto pt-2 flex items-end justify-between gap-2">
                    <div class="leading-tight">${khoiGia(coffee)}</div>
                    <span class="shrink-0 w-8 h-8 rounded-full bg-accent-500 group-hover:bg-accent-600 text-white flex items-center justify-center transition-colors">
                        <i class="fa-solid fa-plus text-sm"></i>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Gom sản phẩm theo danh mục (theo thứ tự danh mục), bỏ danh mục rỗng
function nhomTheoDanhMuc() {
    const groups = window.categoriesData.map(cat => ({
        name: cat.name,
        items: window.coffeesData.filter(c => c.category === cat.name)
    }));
    const known = new Set(window.categoriesData.map(c => c.name));
    const others = window.coffeesData.filter(c => !known.has(c.category));
    if (others.length) groups.push({ name: 'Khác', items: others });
    return groups.filter(g => g.items.length > 0);
}

// Render thực đơn: cột danh mục bên trái + danh sách món theo nhóm bên phải
window.renderMenu = function () {
    const sidebar = document.getElementById('category-filters');
    const list = document.getElementById('all-coffees-grid');
    if (!sidebar || !list) return;

    if (window.coffeesData.length === 0) {
        list.innerHTML = `<p class="text-center text-coffee-400 italic">Chưa có sản phẩm nào trên hệ thống.</p>`;
        return;
    }

    const groups = nhomTheoDanhMuc();

    sidebar.innerHTML = groups.map((g, i) => `
        <button data-cat="${i}" onclick="scrollToCategory(${i})"
            class="cat-btn w-full flex flex-col sm:flex-row items-center gap-1 sm:gap-3 p-1.5 sm:p-2 rounded-xl border-2 border-transparent bg-white shadow-sm text-coffee-600 text-center sm:text-left transition-colors">
            <img src="${g.items[0].image}" alt="" loading="lazy" class="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover shrink-0 bg-coffee-100" onerror="this.style.display='none'">
            <span class="text-[11px] sm:text-sm font-semibold leading-tight line-clamp-2">${g.name}</span>
        </button>
    `).join('');

    list.innerHTML = groups.map((g, i) => `
        <div id="cat-${i}" class="cat-section scroll-mt-[4.5rem] sm:scroll-mt-24">
            <h3 class="bg-accent-50 text-coffee-800 font-bold text-base sm:text-xl px-4 py-2 rounded-xl mb-3">${g.name}</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                ${g.items.map(taoDongMenu).join('')}
            </div>
        </div>
    `).join('');

    capNhatTheoCuon();
};

window.scrollToCategory = function (i) {
    const el = document.getElementById(`cat-${i}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Đánh dấu danh mục đang xem + tab dưới khi cuộn
function capNhatTheoCuon() {
    const indexActive = document.getElementById('view-index')?.classList.contains('active');
    const menuSection = document.getElementById('menu-section');
    const offset = window.innerWidth >= 640 ? 110 : 90;

    if (indexActive && menuSection) {
        const sections = document.querySelectorAll('.cat-section');
        let current = 0;
        sections.forEach((sec, i) => { if (sec.getBoundingClientRect().top - offset <= 0) current = i; });

        const sidebar = document.getElementById('category-filters');
        document.querySelectorAll('.cat-btn').forEach(btn => {
            const active = Number(btn.dataset.cat) === current;
            btn.classList.toggle('bg-accent-50', active);
            btn.classList.toggle('border-accent-500', active);
            btn.classList.toggle('text-coffee-900', active);
            btn.classList.toggle('bg-white', !active);
            btn.classList.toggle('text-coffee-600', !active);
            btn.classList.toggle('border-transparent', !active);
            if (active && sidebar) {
                const top = btn.offsetTop, bottom = top + btn.offsetHeight;
                if (top < sidebar.scrollTop) sidebar.scrollTop = top;
                else if (bottom > sidebar.scrollTop + sidebar.clientHeight) sidebar.scrollTop = bottom - sidebar.clientHeight;
            }
        });

        const inMenu = menuSection.getBoundingClientRect().top - offset <= 0;
        capNhatTabDuoi(inMenu ? 'list' : 'index');
    } else {
        capNhatTabDuoi(null);
    }
}

let dangChoCuon = false;
window.addEventListener('scroll', () => {
    if (dangChoCuon) return;
    dangChoCuon = true;
    requestAnimationFrame(() => { capNhatTheoCuon(); dangChoCuon = false; });
}, { passive: true });

function capNhatTabDuoi(tab) {
    document.querySelectorAll('.bottom-tab').forEach(btn => {
        const active = btn.dataset.tab === tab;
        btn.classList.toggle('text-accent-600', active);
        btn.classList.toggle('text-gray-400', !active);
    });
}

// Render lại toàn bộ sản phẩm
let choCuonToiMenu = false;
window.renderSanPhams = function () {
    const featuredGrid = document.getElementById('featured-grid');
    if (featuredGrid && window.coffeesData.length > 0) {
        const featuredCoffees = window.coffeesData.filter(c => c.featured);
        featuredGrid.innerHTML = featuredCoffees.length > 0
            ? featuredCoffees.map(window.taoTheSanPham).join('')
            : `<p class="text-coffee-500 italic">Hiện chưa có món nổi bật nào.</p>`;
    }
    window.renderMenu();

    if (choCuonToiMenu && window.coffeesData.length > 0) {
        choCuonToiMenu = false;
        document.getElementById('menu-section')?.scrollIntoView();
    }
};

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
    // "Thực đơn" nằm ngay trên trang chủ: mở trang chủ rồi cuộn tới phần menu
    const denMenu = viewId === 'list';
    const viewHienThi = denMenu ? 'index' : viewId;

    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    const activeView = document.getElementById(`view-${viewHienThi}`);
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

    if (denMenu) {
        if (window.coffeesData.length > 0) document.getElementById('menu-section')?.scrollIntoView();
        else choCuonToiMenu = true;
    } else {
        window.scrollTo(0, 0);
    }
    capNhatTheoCuon();
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
    let reply = "Xin lỗi, mình là Trợ lý AI đang trong giai đoạn học hỏi nên chưa hiểu rõ ý bạn. Bạn có thể liên hệ Zalo 093.770.2383 để được hỗ trợ tốt nhất nhé!";

    if (lowerMsg.includes("chào") || lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
        reply = "Chào bạn! Mình có thể giúp gì cho bạn hôm nay?";
    } else if (lowerMsg.includes("giá") || lowerMsg.includes("bao nhiêu")) {
        reply = "Giá các món bên mình dao động từ 15k đến 50k tùy loại. Bạn có thể vào mục <b>Thực Đơn</b> để xem chi tiết nhé!";
    } else if (lowerMsg.includes("menu") || lowerMsg.includes("thực đơn") || lowerMsg.includes("có món gì")) {
        reply = "Bên mình chuyên cà phê mộc, cà phê sữa, trà sữa, trà trái cây và nhiều món khác. Bạn có thể nhấn vào mục Thực Đơn để xem chi tiết nhé!";
    } else if (lowerMsg.includes("địa chỉ") || lowerMsg.includes("ở đâu") || lowerMsg.includes("quán")) {
        const addrs = window.shopAddresses || [];
        reply = addrs.length
            ? `Quán ở: <br/>${addrs.map(a => `• <b>${a}</b>`).join('<br/>')}<br/>Bên mình cũng giao hàng tận nơi khu vực Ninh Phước, Ninh Thuận. Bạn có muốn đặt món không ạ?`
            : "Quán hiện đang giao hàng tận nơi tại khu vực Ninh Phước, Ninh Thuận. Bạn có muốn đặt món không ạ?";
    } else if (lowerMsg.includes("liên hệ") || lowerMsg.includes("sđt") || lowerMsg.includes("số điện thoại") || lowerMsg.includes("zalo")) {
        reply = "Bạn có thể liên hệ trực tiếp qua số điện thoại hoặc Zalo: <b>093.770.2383</b> nha!";
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