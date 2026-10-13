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
        window.shopHours = data.hours || "";
        const addressHtml = window.shopAddresses.map((a, i) => `${window.shopAddresses.length > 1 ? `Quầy ${i + 1}` : 'Địa chỉ'}: ${a}<br/>`).join('');

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
                window.shopPhone = cleanPhone;
                capNhatGioUI();
                if (footerZalo) footerZalo.href = `https://zalo.me/${cleanPhone}`;
                if (modalZalo) modalZalo.href = `https://zalo.me/${cleanPhone}`;
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
            <h3 class="mt-3 text-base sm:text-lg font-bold text-coffee-900 leading-snug line-clamp-2 min-h-[2.75rem] sm:min-h-[3.5rem]">${coffee.name}</h3>
            <div class="mt-1">${khoiGia(coffee)}</div>
            <button data-cart-chon="${coffee.id}" onclick="event.stopPropagation(); themVaoGio('${coffee.id}')" class="mt-2 w-full py-2 rounded-xl bg-accent-50 text-accent-600 hover:bg-accent-500 hover:text-white font-bold text-sm uppercase tracking-wide transition-colors">${nhanNutChon(coffee.id)}</button>
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
                <h4 class="font-bold text-coffee-900 text-base sm:text-lg leading-snug line-clamp-2">${coffee.name}</h4>
                ${coffee.desc ? `<p class="hidden sm:block text-xs text-coffee-400 mt-1 line-clamp-2">${coffee.desc}</p>` : ''}
                <div class="mt-auto pt-2 flex items-end justify-between gap-2">
                    <div class="leading-tight">${khoiGia(coffee)}</div>
                    <div class="shrink-0" data-cart-ctrl="${coffee.id}" onclick="event.stopPropagation()">${dieuKhienSoLuong(coffee.id)}</div>
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
    capNhatGioUI();

    if (choCuonToiMenu && window.coffeesData.length > 0) {
        choCuonToiMenu = false;
        document.getElementById('menu-section')?.scrollIntoView();
    }
};

// Xem chi tiết
window.xemChiTiet = function (coffeeId, addToHistory = true) {
    const coffee = window.coffeesData.find(c => c.id === coffeeId);
    if (!coffee) return;
    window.currentProductId = coffeeId;

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

// --- GIỎ HÀNG ---
const GIO_KEY = '3bich_gio_hang';
const SO_LY_FREESHIP = 3;
window.shopPhone = '0937702383';

let gioHang = {};
try { gioHang = JSON.parse(localStorage.getItem(GIO_KEY)) || {}; } catch (e) { gioHang = {}; }

function luuGio() {
    try { localStorage.setItem(GIO_KEY, JSON.stringify(gioHang)); } catch (e) { /* bỏ qua */ }
}

const giaBan = (c) => Number(c.discountPrice || c.price) || 0;

// Danh sách món trong giỏ (bỏ món đã bị xoá khỏi menu)
function dongGio() {
    return Object.entries(gioHang)
        .map(([id, qty]) => ({ coffee: window.coffeesData.find(c => c.id === id), qty }))
        .filter(d => d.coffee && d.qty > 0);
}

function tongGio() {
    return dongGio().reduce((t, d) => ({ qty: t.qty + d.qty, tien: t.tien + d.qty * giaBan(d.coffee) }), { qty: 0, tien: 0 });
}

function dieuKhienSoLuong(id) {
    const qty = gioHang[id] || 0;
    if (!qty) {
        return `<button onclick="themVaoGio('${id}')" aria-label="Thêm vào giỏ" class="w-8 h-8 rounded-full bg-accent-500 hover:bg-accent-600 text-white flex items-center justify-center transition-colors"><i class="fa-solid fa-plus text-sm"></i></button>`;
    }
    return `<div class="flex items-center gap-2 bg-accent-50 rounded-full p-0.5">
        <button onclick="giamGio('${id}')" aria-label="Bớt" class="w-7 h-7 rounded-full bg-white text-accent-600 border border-accent-500/40 flex items-center justify-center"><i class="fa-solid fa-minus text-xs"></i></button>
        <span class="min-w-[1rem] text-center font-bold text-coffee-900 text-sm">${qty}</span>
        <button onclick="themVaoGio('${id}')" aria-label="Thêm" class="w-7 h-7 rounded-full bg-accent-500 text-white flex items-center justify-center"><i class="fa-solid fa-plus text-xs"></i></button>
    </div>`;
}

function nhanNutChon(id) {
    const qty = gioHang[id] || 0;
    return qty ? `Đã chọn · ${qty}` : 'Chọn';
}

window.themVaoGio = function (id, imLang = false) {
    const coffee = window.coffeesData.find(c => c.id === id);
    if (!coffee) return;
    gioHang[id] = (gioHang[id] || 0) + 1;
    luuGio();
    capNhatGioUI();
    if (!imLang) hienThongBao(`Đã thêm ${coffee.name} vào giỏ`);
};

window.giamGio = function (id) {
    if (!gioHang[id]) return;
    gioHang[id] -= 1;
    if (gioHang[id] <= 0) delete gioHang[id];
    luuGio();
    capNhatGioUI();
};

window.xoaKhoiGio = function (id) {
    delete gioHang[id];
    luuGio();
    capNhatGioUI();
};

window.xoaGioHang = function () {
    if (!confirm('Xóa tất cả món trong giỏ hàng?')) return;
    gioHang = {};
    luuGio();
    capNhatGioUI();
};

let thoiGianThongBao;
function hienThongBao(text) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(thoiGianThongBao);
    thoiGianThongBao = setTimeout(() => el.classList.add('hidden'), 2200);
}

// Nội dung đơn hàng gửi qua Zalo / SMS
function noiDungDon() {
    const { qty, tien } = tongGio();
    const lines = dongGio().map(d => `- ${d.coffee.name} x${d.qty} = ${window.formatVND(d.qty * giaBan(d.coffee))}`);
    const note = (document.getElementById('cart-note')?.value || '').trim();
    return [
        'Đơn hàng 3BichCoffee',
        ...lines,
        `Tổng: ${qty} ly - ${window.formatVND(tien)}${qty >= SO_LY_FREESHIP ? ' (Freeship)' : ''}`,
        note ? `Ghi chú: ${note}` : ''
    ].filter(Boolean).join('\n');
}

function capNhatGioUI() {
    // Bộ điều khiển số lượng trong thực đơn và nút CHỌN
    document.querySelectorAll('[data-cart-ctrl]').forEach(el => { el.innerHTML = dieuKhienSoLuong(el.dataset.cartCtrl); });
    document.querySelectorAll('[data-cart-chon]').forEach(el => { el.textContent = nhanNutChon(el.dataset.cartChon); });

    const { qty, tien } = tongGio();
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = qty;
        el.classList.toggle('hidden', qty === 0);
    });

    const bar = document.getElementById('cart-bar');
    if (bar) {
        bar.classList.toggle('hidden', qty === 0);
        bar.classList.toggle('flex', qty > 0);
        document.getElementById('cart-bar-total').textContent = `${qty} món · ${window.formatVND(tien)}`;
    }
    document.body.classList.toggle('has-cart', qty > 0);

    veGioHang();
}

function veGioHang() {
    const list = document.getElementById('cart-items');
    if (!list) return;
    const rows = dongGio();
    const { qty, tien } = tongGio();

    list.innerHTML = rows.length ? rows.map(({ coffee, qty }) => `
        <div class="flex gap-3 py-3">
            <img src="${coffee.image}" alt="" class="w-14 h-[4.5rem] rounded-lg object-cover bg-coffee-100 shrink-0" onerror="this.src='https://placehold.co/300x400?text=3Bich'">
            <div class="flex-1 min-w-0 flex flex-col">
                <div class="flex justify-between gap-2">
                    <span class="font-bold text-coffee-900 leading-snug line-clamp-2">${coffee.name}</span>
                    <button onclick="xoaKhoiGio('${coffee.id}')" class="text-gray-300 hover:text-red-500 shrink-0" aria-label="Xóa"><i class="fa-solid fa-trash-can text-sm"></i></button>
                </div>
                <span class="text-xs text-coffee-400">${window.formatVND(giaBan(coffee))} / ly</span>
                <div class="mt-auto pt-1 flex items-center justify-between">
                    ${dieuKhienSoLuong(coffee.id)}
                    <span class="font-bold text-coffee-900">${window.formatVND(qty * giaBan(coffee))}</span>
                </div>
            </div>
        </div>`).join('')
        : `<div class="py-10 text-center text-coffee-400">
            <i class="fa-solid fa-bag-shopping text-4xl mb-3 opacity-50"></i>
            <p class="font-semibold">Giỏ hàng đang trống</p>
            <button onclick="dongGioHang(); navigate('list')" class="mt-4 text-accent-600 font-bold">Xem thực đơn <i class="fa-solid fa-chevron-right text-xs"></i></button>
        </div>`;

    document.getElementById('cart-footer').classList.toggle('hidden', rows.length === 0);
    document.getElementById('cart-total').textContent = window.formatVND(tien);
    document.getElementById('cart-qty').textContent = `(${qty} ly)`;

    const ship = document.getElementById('cart-ship');
    if (qty >= SO_LY_FREESHIP) {
        ship.innerHTML = '<i class="fa-solid fa-motorcycle mr-1"></i> Đơn của bạn được FREESHIP';
        ship.className = 'text-sm font-semibold rounded-xl px-3 py-2 bg-green-50 text-green-700';
    } else {
        ship.innerHTML = `<i class="fa-solid fa-motorcycle mr-1"></i> Thêm ${SO_LY_FREESHIP - qty} ly nữa để được FREESHIP`;
        ship.className = 'text-sm font-semibold rounded-xl px-3 py-2 bg-accent-50 text-accent-600';
    }

    document.getElementById('cart-call').href = `tel:${window.shopPhone}`;
    // iOS dùng "&body=", Android dùng "?body="; "?&body=" chạy được trên cả hai
    document.getElementById('cart-sms').href = `sms:${window.shopPhone}?&body=${encodeURIComponent(noiDungDon())}`;
}

window.moGioHang = function () {
    veGioHang();
    document.getElementById('cart-drawer').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
};

window.dongGioHang = function () {
    document.getElementById('cart-drawer').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
};

// Ghi chú thay đổi -> cập nhật nội dung SMS
document.getElementById('cart-note')?.addEventListener('input', () => {
    document.getElementById('cart-sms').href = `sms:${window.shopPhone}?&body=${encodeURIComponent(noiDungDon())}`;
});

// Zalo không cho điền sẵn tin nhắn: sao chép đơn rồi mở Zalo để khách dán vào
function saoChep(text) {
    let ok = false;
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select(); ta.setSelectionRange(0, text.length);
        ok = document.execCommand('copy');
        ta.remove();
    } catch (e) { ok = false; }
    if (!ok && navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => { });
        ok = true;
    }
    return ok;
}

window.datQuaZalo = function () {
    const text = noiDungDon();
    const daChep = saoChep(text);
    alert(daChep
        ? 'Đã sao chép đơn hàng. Khi Zalo mở ra, bạn chỉ cần DÁN vào ô chat và gửi cho quán nhé!'
        : 'Bạn vui lòng gửi nội dung đơn sau qua Zalo:\n\n' + text);
    window.location.href = `https://zalo.me/${window.shopPhone}`;
};

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

// Bỏ dấu, viết thường để hiểu cả câu gõ không dấu: "uống gì" -> "uong gi"
function boDau(text) {
    return (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

const escHtml = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ngauNhien = (arr) => arr[Math.floor(Math.random() * arr.length)];
const tronMang = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Tin nhắn có chứa cụm từ (so khớp theo từ, không bị "hi" khớp nhầm trong "ship")
function coCum(msg, phrases) {
    const m = ` ${msg} `;
    return phrases.some(p => m.includes(` ${p} `));
}

const GOI_Y_CHUNG = ['Hôm nay uống gì ngon?', 'Xem thực đơn', 'Giờ mở cửa', 'Quán ở đâu?', 'Có freeship không?'];

// Thẻ món trong khung chat, có nút thêm vào giỏ
function theMonChat(c) {
    return `<div class="flex items-center gap-2 bg-coffee-50 rounded-xl p-1.5 mt-2">
        <img src="${c.image}" alt="" class="w-10 h-12 rounded-lg object-cover bg-coffee-100 shrink-0" onerror="this.style.visibility='hidden'">
        <div class="flex-1 min-w-0">
            <div class="font-bold text-coffee-900 text-[13px] leading-tight line-clamp-2">${escHtml(c.name)}</div>
            <div class="text-xs"><span class="font-semibold text-accent-600">${window.formatVND(giaBan(c))}</span> <span class="text-coffee-400">· ${escHtml(c.category || '')}</span></div>
        </div>
        <button onclick="themVaoGio('${c.id}')" class="shrink-0 text-xs font-bold bg-accent-500 hover:bg-accent-600 text-white rounded-full px-2.5 py-1.5"><i class="fa-solid fa-plus"></i> Thêm</button>
    </div>`;
}

function danhSachMonChat(list) {
    return list.map(theMonChat).join('');
}

// Tìm món được nhắc tới trong câu hỏi (khớp đủ các từ trong tên món)
function timMon(msg) {
    const ketQua = window.coffeesData
        .map(c => ({ c, ten: boDau(c.name) }))
        .filter(({ ten }) => ten && ` ${msg} `.includes(` ${ten} `))
        .sort((a, b) => b.ten.length - a.ten.length);
    return ketQua.map(k => k.c);
}

function timDanhMuc(msg) {
    const tuKhoa = {
        'ca phe': ['ca phe', 'cafe', 'caphe', 'cf', 'coffee', 'cafe sua', 'den da'],
        'tra': ['tra', 'tea', 'tra trai cay'],
        'cacao': ['cacao', 'matcha', 'milo', 'socola', 'chocolate'],
        'soda': ['soda', 'sua chua', 'yaourt', 'yogurt', 'da ua']
    };
    // Ưu tiên khớp đúng tên danh mục
    const theoTen = window.categoriesData.find(cat => coCum(msg, [boDau(cat.name)]));
    if (theoTen) return theoTen.name;
    for (const [goc, kws] of Object.entries(tuKhoa)) {
        if (coCum(msg, kws)) {
            const cat = window.categoriesData.find(c => boDau(c.name).includes(goc));
            if (cat) return cat.name;
        }
    }
    return null;
}

const CAU_DUA = [
    'Cà phê với mình giống như wifi vậy, thiếu là cả ngày "mất kết nối" liền 😆',
    'Bí quyết dậy sớm của mình: một ly cà phê đen... và thêm một ly nữa ☕☕',
    'Người ta yêu từ cái nhìn đầu tiên, còn mình thì yêu từ ngụm cà phê đầu tiên 😍',
    'Đừng để deadline đánh gục bạn, để cà phê 3Bich đánh thức bạn trước 💪'
];

// Mỗi ý định: các cụm từ (đã bỏ dấu) + hàm trả lời { html, chips }
const Y_DINH = [
    {
        ten: 'goi_y', kws: ['uong gi', 'uon gi', 'mon gi ngon', 'gi ngon', 'goi y', 'tu van', 'recommend', 'ngon nhat', 'ban chay', 'best seller', 'nen uong', 'nen goi', 'mon nao ngon', 'chon mon', 'hot'],
        tra: () => {
            const noiBat = window.coffeesData.filter(c => c.featured);
            const nguon = noiBat.length ? noiBat : window.coffeesData;
            if (!nguon.length) return { html: 'Menu đang tải, bạn đợi mình xíu nha ⏳' };
            const chon = tronMang(nguon).slice(0, 3);
            return {
                html: ngauNhien(['Để mình "bắt mạch" khẩu vị giùm bạn nha 😎 Hôm nay thử mấy món này xem:', 'Hỏi đúng người rồi đó! Mấy món được khách mê nhất nè 🤩:', 'Sáng nay mà có ly này thì tỉnh như sáo luôn ☀️:'])
                    + danhSachMonChat(chon),
                chips: ['Gợi ý món khác', 'Món nào rẻ nhất?', 'Xem thực đơn']
            };
        }
    },
    {
        ten: 're', kws: ['re nhat', 'gia re', 're re', 'tiet kiem', 'it tien', 'binh dan'],
        tra: () => {
            const re = [...window.coffeesData].sort((a, b) => giaBan(a) - giaBan(b)).slice(0, 3);
            return { html: 'Ngon mà hạt dẻ, ví không đau nè 💸:' + danhSachMonChat(re), chips: ['Hôm nay uống gì ngon?', 'Có freeship không?'] };
        }
    },
    {
        ten: 'gia', kws: ['gia', 'bao nhieu', 'bn tien', 'nhieu tien', 'bao tien', 'price'],
        tra: () => {
            const gia = window.coffeesData.map(giaBan).filter(Boolean);
            if (!gia.length) return { html: 'Menu đang tải, bạn đợi mình xíu nha ⏳' };
            return {
                html: `Giá bên mình siêu dễ thương, chỉ từ <b>${window.formatVND(Math.min(...gia))}</b> đến <b>${window.formatVND(Math.max(...gia))}</b> thôi 😊<br/>Bạn gõ tên món (vd: <i>"bạc xỉu bao nhiêu"</i>) để mình báo giá chính xác nha!`,
                chips: ['Món nào rẻ nhất?', 'Xem thực đơn']
            };
        }
    },
    {
        ten: 'menu', kws: ['menu', 'thuc don', 'co mon gi', 'co gi', 'ban gi', 'danh muc', 'cac mon', 'list mon', 'mon an'],
        tra: () => ({
            html: `Menu nhà 3Bich có ${window.coffeesData.length} món, chia thành mấy nhóm nè 📋:<br/>`
                + window.categoriesData.map(cat => `• <b>${escHtml(cat.name)}</b> (${window.coffeesData.filter(c => c.category === cat.name).length} món)`).join('<br/>')
                + '<br/>Bạn muốn xem nhóm nào?',
            chips: window.categoriesData.map(c => c.name).slice(0, 5)
        })
    },
    {
        ten: 'gio', kws: ['may gio', 'gio mo cua', 'mo cua', 'dong cua', 'gio lam viec', 'mo luc', 'mo khi nao', 'gio nao', 'con mo', 'open'],
        tra: () => ({
            html: `Quán mở cửa <b>${escHtml(window.shopHours || 'Thứ 2 - Chủ nhật: 06:00 - 10:30')}</b> ⏰<br/>Dậy sớm ghé quán làm ly cà phê cho tỉnh táo nha! ☕`,
            chips: ['Quán ở đâu?', 'Hôm nay uống gì ngon?']
        })
    },
    {
        ten: 'dia_chi', kws: ['dia chi', 'o dau', 'cho nao', 'quan o', 'duong nao', 'chi duong', 'ban do', 'map', 'quay', 'chi nhanh', 'co so'],
        tra: () => {
            const addrs = window.shopAddresses || [];
            return {
                html: (addrs.length
                    ? 'Ghé 3Bich tại đây nha 📍:<br/>' + addrs.map((a, i) => `• ${addrs.length > 1 ? `<b>Quầy ${i + 1}:</b> ` : ''}${escHtml(a)}`).join('<br/>')
                    : 'Quán ở Ninh Phước, Ninh Thuận nha 📍')
                    + '<br/>Xem bản đồ ở trang <a href="introduce.html" class="underline font-semibold">Giới thiệu</a>. Lười đi thì để shipper chạy giùm, <b>freeship từ 3 ly</b> 🛵',
                chips: ['Giờ mở cửa', 'Cách đặt hàng']
            };
        }
    },
    {
        ten: 'ship', kws: ['ship', 'freeship', 'free ship', 'giao', 'giao hang', 'van chuyen', 'shipper', 'mang den', 'phi ship'],
        tra: () => ({
            html: 'Có liền! 🛵 <b>FREESHIP cho đơn từ 3 ly</b>, giao tận nơi khu vực Ninh Phước.<br/>Rủ thêm đồng nghiệp, bạn bè gom đơn là được miễn phí ship ngay 😉',
            chips: ['Cách đặt hàng', 'Hôm nay uống gì ngon?']
        })
    },
    {
        ten: 'dat_hang', kws: ['dat hang', 'dat mon', 'order', 'mua', 'dat', 'cach dat', 'lam sao dat', 'muon dat'],
        tra: () => ({
            html: 'Đặt món dễ ợt nè 👇<br/>1️⃣ Bấm <b>+</b> ở món bạn thích để cho vào giỏ<br/>2️⃣ Mở <b>Giỏ hàng</b> xem tổng tiền, ghi chú địa chỉ<br/>3️⃣ Bấm <b>Đặt qua Zalo</b> hoặc <b>Gọi điện</b> là xong!<br/><button onclick="moGioHang()" class="mt-2 text-xs font-bold bg-coffee-700 text-white rounded-full px-3 py-1.5"><i class="fa-solid fa-bag-shopping"></i> Mở giỏ hàng</button>',
            chips: ['Hôm nay uống gì ngon?', 'Xem thực đơn']
        })
    },
    {
        ten: 'gio_hang', kws: ['gio hang', 'gio cua toi', 'don cua toi', 'da chon', 'tong tien', 'tinh tien'],
        tra: () => {
            const { qty, tien } = tongGio();
            if (!qty) return { html: 'Giỏ hàng của bạn đang trống trơn nè 🥲 Chọn món đi để mình tính tiền cho!', chips: ['Hôm nay uống gì ngon?', 'Xem thực đơn'] };
            return {
                html: `Giỏ của bạn có <b>${qty} ly</b>, tổng <b>${window.formatVND(tien)}</b>${qty >= SO_LY_FREESHIP ? ' và được <b>FREESHIP</b> 🎉' : ` (thêm ${SO_LY_FREESHIP - qty} ly nữa là freeship đó 😉)`}<br/><button onclick="moGioHang()" class="mt-2 text-xs font-bold bg-coffee-700 text-white rounded-full px-3 py-1.5"><i class="fa-solid fa-bag-shopping"></i> Xem giỏ hàng</button>`
            };
        }
    },
    {
        ten: 'lien_he', kws: ['lien he', 'sdt', 'so dien thoai', 'dien thoai', 'zalo', 'goi', 'hotline', 'phone', 'facebook', 'fb', 'tiktok'],
        tra: () => {
            const sdt = window.shopPhone || '0937702383';
            const hienThi = sdt.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
            return {
                html: `Gọi hoặc nhắn Zalo cho quán qua số <b>${hienThi}</b> nha 📞<br/><a href="https://zalo.me/${sdt}" target="_blank" class="inline-block mt-2 text-xs font-bold bg-[#0068ff] text-white rounded-full px-3 py-1.5 no-underline">Nhắn Zalo</a> <a href="tel:${sdt}" class="inline-block mt-2 text-xs font-bold bg-green-500 text-white rounded-full px-3 py-1.5 no-underline">Gọi ngay</a>`
            };
        }
    },
    {
        ten: 'tuy_chinh', kws: ['it da', 'khong da', 'it ngot', 'khong duong', 'it duong', 'nhieu da', 'them sua', 'size', 'ly lon'],
        tra: () => ({ html: 'Được luôn! 👌 Bạn ghi yêu cầu (ít đá, ít ngọt...) vào ô <b>Ghi chú</b> trong giỏ hàng, quán sẽ pha đúng ý bạn nha.' })
    },
    {
        ten: 'thanh_toan', kws: ['thanh toan', 'chuyen khoan', 'momo', 'tien mat', 'stk', 'banking'],
        tra: () => ({ html: 'Về thanh toán, bạn trao đổi trực tiếp với quán khi đặt qua Zalo hoặc điện thoại nha 💬', chips: ['Liên hệ quán'] })
    },
    {
        ten: 'cam_on', kws: ['cam on', 'thank', 'thanks', 'tks', 'thank you', 'ok cam on'],
        tra: () => ({ html: ngauNhien(['Không có chi nè 🥰 Chúc bạn một ngày thật nhiều năng lượng!', 'Hihi, phục vụ bạn là niềm vui của mình ☕💛', 'Cảm ơn bạn đã ghé 3Bich! Nhớ quay lại uống cà phê nha 😘']) })
    },
    {
        ten: 'tam_biet', kws: ['bye', 'tam biet', 'hen gap lai', 'di nha', 'pp'],
        tra: () => ({ html: 'Bye bye 👋 Hẹn gặp lại bạn ở 3Bich nha, nhớ ghé uống cà phê sáng đó!' })
    },
    {
        ten: 'dua', kws: ['ke chuyen', 'chuyen cuoi', 'vui', 'buon', 'chan', 'met', 'buon ngu', 'joke', 'hai'],
        tra: () => ({ html: ngauNhien(CAU_DUA) + '<br/>Mệt thì làm ly cà phê đi, mình gợi ý cho nè!', chips: ['Hôm nay uống gì ngon?'] })
    },
    {
        ten: 'bot', kws: ['ban la ai', 'bot', 'ten gi', 'ai do', 'robot', 'nguoi that'],
        tra: () => ({ html: 'Mình là <b>3Bich Assistant</b> 🤖, trợ lý nhỏ của quán. Mình rành menu, giá, giờ mở cửa và chỉ đường lắm nha. Hỏi gì cứ hỏi!', chips: GOI_Y_CHUNG.slice(0, 3) })
    },
    {
        ten: 'chao', kws: ['chao', 'xin chao', 'hello', 'hi', 'hey', 'alo', 'helo', 'chao ban', 'chao shop', 'e oi', 'shop oi', 'ad oi'],
        tra: () => ({ html: ngauNhien(['Chào bạn nè 👋 Hôm nay muốn làm ly gì cho tỉnh táo?', 'Hello hello ☀️ 3Bich nghe nè, bạn cần gì nhỉ?', 'Chào bạn! Ghé 3Bich là đúng chỗ rồi đó ☕ Mình giúp gì được bạn?']), chips: GOI_Y_CHUNG })
    }
];

function botTraLoi(userMsg) {
    const msg = boDau(userMsg);

    // 1. Hỏi về một món cụ thể -> báo giá + nút thêm vào giỏ
    const mon = timMon(msg);
    const hoiGiaHoacMua = coCum(msg, ['gia', 'bao nhieu', 'bn', 'mua', 'dat', 'lay', 'cho', 'co', 'ngon', 'khong']) || msg.split(' ').length <= 4;
    if (mon.length && hoiGiaHoacMua && !coCum(msg, ['ship', 'giao', 'dia chi', 'o dau', 'mo cua'])) {
        const chon = mon.slice(0, 3);
        return {
            html: (chon.length === 1
                ? `<b>${escHtml(chon[0].name)}</b> giá <b>${window.formatVND(giaBan(chon[0]))}</b> nè 😋${chon[0].desc ? `<br/><span class="text-coffee-500">${escHtml(chon[0].desc)}</span>` : ''}`
                : 'Mình tìm được mấy món này nè:') + danhSachMonChat(chon),
            chips: ['Hôm nay uống gì ngon?', 'Cách đặt hàng']
        };
    }

    // 2. Ý định có nhiều cụm từ khớp nhất
    let tot = null, diem = 0;
    for (const y of Y_DINH) {
        const d = y.kws.filter(k => coCum(msg, [k])).reduce((t, k) => t + k.split(' ').length, 0);
        if (d > diem) { diem = d; tot = y; }
    }

    // 3. Nhắc tới một nhóm món (trà, matcha, soda...) -> liệt kê nhóm đó
    const danhMuc = timDanhMuc(msg);
    if (danhMuc && (!tot || ['menu', 'goi_y', 'gia', 'chao'].includes(tot.ten) || diem <= 1)) {
        const mons = window.coffeesData.filter(c => c.category === danhMuc);
        return {
            html: `Nhóm <b>${escHtml(danhMuc)}</b> có ${mons.length} món nè 😋:` + danhSachMonChat(mons.slice(0, 6)) + (mons.length > 6 ? `<div class="mt-1 text-xs">...và ${mons.length - 6} món nữa trong Thực đơn</div>` : ''),
            chips: ['Hôm nay uống gì ngon?', 'Xem thực đơn']
        };
    }

    if (tot) return tot.tra();

    // 4. Không hiểu -> trả lời vui + gợi ý câu hỏi
    return {
        html: ngauNhien([
            'Ui, câu này hơi khó với mình rồi 😅 Bạn thử hỏi kiểu khác, hoặc chọn nhanh bên dưới nha!',
            'Mình chưa hiểu lắm 🙈 Mình rành menu, giá, giờ mở cửa với địa chỉ lắm, hỏi mình mấy cái đó nha!'
        ]) + `<br/>Cần gấp thì nhắn Zalo <b>093.770.2383</b> cho quán nhé.`,
        chips: GOI_Y_CHUNG
    };
}

window.sendChatMessage = function (preset) {
    const inputEl = document.getElementById('chatbot-input');
    const message = (typeof preset === 'string' ? preset : inputEl.value).trim();
    if (!message) return;

    appendMessage(escHtml(message), 'user');
    inputEl.value = '';

    // Hiệu ứng "đang gõ..."
    const typing = appendMessage('<span class="inline-flex gap-1"><span class="w-1.5 h-1.5 bg-coffee-400 rounded-full animate-bounce"></span><span class="w-1.5 h-1.5 bg-coffee-400 rounded-full animate-bounce [animation-delay:150ms]"></span><span class="w-1.5 h-1.5 bg-coffee-400 rounded-full animate-bounce [animation-delay:300ms]"></span></span>', 'bot');
    setTimeout(() => {
        typing.remove();
        const { html, chips } = botTraLoi(message);
        appendMessage(html, 'bot', chips);
    }, 500 + Math.random() * 400);
};

window.hoiNhanh = (text) => window.sendChatMessage(text);

function appendMessage(html, sender, chips) {
    const messagesEl = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start mb-3 ' + (sender === 'user' ? 'justify-end' : '');

    if (sender === 'user') {
        msgDiv.innerHTML = `
            <div class="bg-coffee-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] text-sm">${html}</div>`;
    } else {
        const chipHtml = chips && chips.length
            ? `<div class="flex flex-wrap gap-1.5 mt-2">${chips.map(c => `<button onclick="hoiNhanh('${escHtml(c).replace(/&#39;/g, "\\'")}')" class="text-xs font-semibold bg-accent-50 text-accent-600 border border-accent-500/30 rounded-full px-2.5 py-1 hover:bg-accent-500 hover:text-white transition-colors">${escHtml(c)}</button>`).join('')}</div>`
            : '';
        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-coffee-600 text-white flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <i class="fa-solid fa-robot text-xs"></i>
            </div>
            <div class="bg-white text-coffee-800 p-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] text-sm leading-relaxed">${html}${chipHtml}</div>`;
    }

    messagesEl.appendChild(msgDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msgDiv;
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