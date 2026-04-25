// --- CÁC HÀM TIỆN ÍCH DÙNG CHUNG (COMMON) ---

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Hàm format tiền tệ VNĐ
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hàm tạo thẻ sản phẩm (dùng chung cho việc render mảng coffees)
function taoTheSanPham(coffee) {
    return `
        <div class="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer" onclick="xemChiTiet('${coffee.id}')">
            <div class="relative h-56 overflow-hidden img-placeholder">
                <img src="${coffee.image}" alt="${coffee.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="p-5">
                <div class="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-1">${coffee.category}</div>
                <h3 class="text-xl font-bold text-coffee-900 mb-2">${coffee.name}</h3>
                <div class="flex justify-between items-center mt-4">
                    <span class="text-lg font-bold text-coffee-600">${formatVND(coffee.price)}</span>
                    <button class="w-10 h-10 rounded-full bg-coffee-100 text-coffee-700 flex items-center justify-center group-hover:bg-coffee-600 group-hover:text-white transition-colors">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Mở modal đặt hàng
function openOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// Đóng modal đặt hàng
function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Ngăn chặn xem mã nguồn, chuột phải và F12
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
    // Chặn Ctrl+Shift+J (Mở Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }
    // Chặn Ctrl+U (Xem Source)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
});

setInterval(function () {
    (function () {
        return false;
    }
    ['constructor']('debugger')
    ['call']());
}, 100);


