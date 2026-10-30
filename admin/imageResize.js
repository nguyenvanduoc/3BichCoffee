// Thu nhỏ ảnh ngay trên trình duyệt trước khi tải lên ImgBB,
// để ảnh món nhẹ (khoảng 30–80KB) thay vì ảnh gốc điện thoại vài MB.

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được file ảnh')); };
        img.src = url;
    });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

/**
 * @param {File} file
 * @param {{ width: number, height?: number, quality?: number }} opt
 *   Có height: cắt giữa theo đúng tỉ lệ width:height (ảnh món 3:4).
 *   Không có height: giữ tỉ lệ gốc, chỉ thu nhỏ chiều ngang về tối đa width.
 * @returns {Promise<File>}
 */
export async function resizeImage(file, { width, height, quality = 0.8 }) {
    const img = await loadImage(file);
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight, dw, dh;
    if (height) {
        const target = width / height;
        if (sw / sh > target) { const nw = sh * target; sx = (sw - nw) / 2; sw = nw; }
        else { const nh = sw / target; sy = (sh - nh) / 2; sh = nh; }
        dw = Math.min(width, Math.round(sw)); dh = Math.round(dw / target);
    } else {
        dw = Math.min(width, sw); dh = Math.round(sh * dw / sw);
    }
    const canvas = document.createElement('canvas');
    canvas.width = dw; canvas.height = dh;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff'; // ảnh PNG trong suốt -> nền trắng
    ctx.fillRect(0, 0, dw, dh);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

    // WebP nếu trình duyệt hỗ trợ, nếu không thì JPEG
    let blob = await canvasToBlob(canvas, 'image/webp', quality);
    let ext = 'webp';
    if (!blob || blob.type !== 'image/webp') { blob = await canvasToBlob(canvas, 'image/jpeg', quality); ext = 'jpg'; }
    const name = (file.name || 'anh').replace(/\.[^.]+$/, '') + '.' + ext;
    return new File([blob], name, { type: blob.type });
}
