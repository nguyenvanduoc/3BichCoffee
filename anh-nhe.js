// Ảnh gốc (ImgBB, vài MB/ảnh) -> bản WebP nhẹ tự host trong IMG/.
// Ảnh món mới tải qua trang admin đã được thu nhỏ sẵn nên không cần thêm vào đây.
export const ANH_NHE = {
    "https://3bichcoffee.com/IMG/ca-phe-sua.jpg": "IMG/menu/ca-phe-sua.webp",
    "https://i.ibb.co/0jtwmTKH/matchat.png": "IMG/menu/matcha-sua-dua.webp",
    "https://i.ibb.co/1t9RVkcB/Bac-Xiu-Muoi.jpg": "IMG/menu/bac-xiu-muoi.webp",
    "https://i.ibb.co/27LMLg9R/Tra-Dao.png": "IMG/menu/tra-dao-dam.webp",
    "https://i.ibb.co/7wrFtD4/Cafe-Den.jpg": "IMG/menu/ca-phe-den.webp",
    "https://i.ibb.co/GQqNg9MG/Gemini-Generated-Image-2tpz3s2tpz3s2tpz.png": "IMG/menu/ca-phe-may-den.webp",
    "https://i.ibb.co/H8NK3ZR/Gemini-Generated-Image-5bag3q5bag3q5bag.png": "IMG/menu/ca-phe-may-sua.webp",
    "https://i.ibb.co/Kz5Rvqc2/Gemini-Generated-Image-q7zj9xq7zj9xq7zj.png": "IMG/menu/Americano.webp",
    "https://i.ibb.co/Lz3mM0KM/Hinh-Anh-Dang-Cap-Nhat.jpg": "IMG/menu/dang-cap-nhat.webp",
    "https://i.ibb.co/MkndYZ3j/cafe-Muoi.png": "IMG/menu/ca-phe-kem-muoi.webp",
    "https://i.ibb.co/S7XfXNGP/1111.jpg": "IMG/menu/milo-sua-dam.webp",
    "https://i.ibb.co/WWG0bmx9/cafesuatuoi.png": "IMG/menu/ca-phe-sua-tuoi.webp",
    "https://i.ibb.co/Xxj68kGY/suachuavietquoc.jpg": "IMG/menu/sua-chua-viet-quat.webp",
    "https://i.ibb.co/tMkVd70D/IMG-3154.jpg": "IMG/menu/cacao-kem-muoi.webp",
    "https://i.ibb.co/ycNRVy3q/matcha-xoanen.jpg": "IMG/gioi-thieu.webp",
    "https://i.ibb.co/zTgSdnC4/Gemini-Generated-Image-k0cb1pk0cb1pk0cb.png": "IMG/menu/bac-xiu.webp",
    "https://i.ibb.co/zWn6SR1m/Gemini-Generated-Image-1hugkx1hugkx1hug.png": "IMG/menu/sam-dua-sua.webp",
    "https://i.ibb.co/zhCLx5kZ/Tra-Dao2.png": "IMG/menu/tra-vai-dam.webp",
    "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80": "IMG/menu/cacao-sua-da.webp"
};

export const anhNhe = (url) => ANH_NHE[url] || url;
