import { collection, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
window.xemChiTiet = function (coffeeId) {
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

    window.navigate('detail');
};

// --- CÁC HÀM UI ---
window.navigate = function (viewId, addToHistory = true) {
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) activeView.classList.add('active');
    else { document.getElementById('view-index').classList.add('active'); viewId = 'index'; }
    if (addToHistory) history.pushState({ view: viewId }, '', '#' + viewId);
    window.scrollTo(0, 0);
};

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.view) window.navigate(event.state.view, false);
    else {
        const hash = window.location.hash.replace('#', '') || 'index';
        window.navigate(hash === 'detail' ? 'list' : hash, false);
    }
});

window.toggleMobileMenu = function () {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
};

window.openOrderModal = () => { document.getElementById('order-modal').classList.remove('hidden'); document.getElementById('order-modal').classList.add('flex'); };
window.closeOrderModal = () => { document.getElementById('order-modal').classList.add('hidden'); document.getElementById('order-modal').classList.remove('flex'); };

// Khởi tạo
const initialView = window.location.hash.replace('#', '') || 'index';
if (initialView === 'detail') { window.navigate('list', false); history.replaceState({ view: 'list' }, '', '#list'); }
else { window.navigate(initialView, false); history.replaceState({ view: initialView }, '', '#' + initialView); }