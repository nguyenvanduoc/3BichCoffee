// --- DỮ LIỆU SẢN PHẨM 3BICHCOFFEE ---

// Danh sách các nhóm danh mục (Sử dụng ID kiểu INT để chuẩn bị cho Database)
const categories = [
    { id: 1, name: 'Cà Phê' },
    { id: 2, name: 'Trà & Trái Cây' },
    { id: 3, name: 'Cacao & Matcha' },
    { id: 4, name: 'Soda & Sữa Chua' }
];

const coffees = [
    // ========== 1. NHÓM CÀ PHÊ (COFFEE) ==========
    {
        id: 'ca-phe-den',
        name: 'Cà Phê Đen',
        price: 12000,
        categoryId: 1,
        category: 'Cà Phê',
        desc: 'Cà phê đen nguyên chất, đậm đà và mạnh mẽ. Lựa chọn hoàn hảo cho những ai yêu thích vị đắng truyền thống, đánh thức mọi giác quan.',
        ingredients: ['Cà phê Robusta rang mộc', 'Đường (tùy chọn)', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&w=600&q=80',
        featured: true
    },
    {
        id: 'ca-phe-sua',
        name: 'Cà Phê Sữa',
        price: 15000,
        categoryId: 1,
        category: 'Cà Phê',
        desc: 'Thức uống đặc trưng của Việt Nam. Sự kết hợp hoàn hảo giữa cà phê phin đậm đà và sữa đặc ngọt ngào, thêm đá mát lạnh.',
        ingredients: ['Cà phê Robusta nguyên chất', 'Sữa đặc có đường', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=600&q=80',
        featured: true
    },
    {
        id: 'bac-xiu',
        name: 'Bạc Xỉu',
        price: 20000,
        categoryId: 1,
        category: 'Cà Phê',
        desc: 'Phù hợp cho những ai thích vị béo ngọt nhiều hơn vị đắng. "Sữa đá pha thêm chút cà phê" theo phong cách Sài Gòn xưa.',
        ingredients: ['Sữa tươi', 'Sữa đặc', '1 shot cà phê phin', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=600&q=80',
        featured: true
    },
    {
        id: 'ca-phe-kem-muoi',
        name: 'Cà Phê Kem Muối',
        price: 25000,
        categoryId: 1,
        category: 'Cà Phê',
        desc: 'Cà phê đen đậm đà phủ lớp kem muối béo ngậy. Vị mặn nhẹ của kem hòa quyện cùng vị đắng cà phê tạo nên trải nghiệm độc đáo.',
        ingredients: ['Cà phê nguyên chất', 'Kem whipping', 'Muối biển', 'Sữa đặc', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
        featured: true
    },
    {
        id: 'ca-phe-sua-dua',
        name: 'Cà Phê Sữa Dừa',
        price: 25000,
        categoryId: 1,
        category: 'Cà Phê',
        desc: 'Cà phê kết hợp cùng nước cốt dừa béo thơm, tạo nên hương vị nhiệt đới đặc trưng. Mát lạnh, thơm ngon, khó cưỡng.',
        ingredients: ['Cà phê nguyên chất', 'Nước cốt dừa', 'Sữa đặc', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1461023058943-0708e52e5058?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'ca-phe-sua-tuoi',
        name: 'Cà Phê Sữa Tươi',
        price: 20000,
        categoryId: 1,
        category: 'Cà Phê',
        desc: 'Cà phê hòa quyện cùng sữa tươi thanh mát. Vị nhẹ nhàng hơn so với sữa đặc, phù hợp cho buổi chiều thư thả.',
        ingredients: ['Cà phê nguyên chất', 'Sữa tươi không đường', 'Đường (tùy chọn)', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'ca-phe-kem-nau',
        name: 'Cà Phê Kem Nâu',
        price: 25000,
        categoryId: 1,
        category: 'Cà Phê',
        desc: 'Cà phê đậm đà phủ lớp kem nâu mịn màng từ caramel. Sự kết hợp ngọt ngào giữa đắng và béo, mang đến cảm giác sang trọng.',
        ingredients: ['Cà phê nguyên chất', 'Kem nâu caramel', 'Sữa đặc', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'ca-phe-dam-beo',
        name: 'Cà Phê Dầm Béo',
        price: 25000,
        categoryId: 1,
        category: 'Cà Phê',
        desc: 'Cà phê đen đậm đà kết hợp lớp kem béo dầm mịn, tạo nên vị thơm béo ngậy khó quên. Thức uống trending được yêu thích.',
        ingredients: ['Cà phê nguyên chất', 'Kem béo', 'Sữa đặc', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
        featured: false
    },

    // ========== 2. NHÓM TRÀ & TRÁI CÂY (TEA & FRUIT) ==========
    {
        id: 'tra-tac',
        name: 'Trà Tắc',
        price: 10000,
        categoryId: 2,
        category: 'Trà & Trái Cây',
        desc: 'Trà pha cùng tắc (quất) tươi, vị chua nhẹ thanh mát. Thức uống giải khát đơn giản mà hiệu quả cho ngày hè.',
        ingredients: ['Trà đen', 'Tắc (quất) tươi', 'Đường', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'cam-vat',
        name: 'Cam Vắt',
        price: 15000,
        categoryId: 2,
        category: 'Trà & Trái Cây',
        desc: 'Nước cam tươi vắt nguyên chất, giàu vitamin C. Tươi mát, bổ dưỡng và tự nhiên 100%.',
        ingredients: ['Cam tươi vắt', 'Đường (tùy chọn)', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'tra-vai-dam',
        name: 'Trà Vải Dầm',
        price: 20000,
        categoryId: 2,
        category: 'Trà & Trái Cây',
        desc: 'Trà hoa nhài kết hợp cùng vải thiều dầm tươi. Hương thơm ngọt tự nhiên, thanh mát và thư giãn.',
        ingredients: ['Trà hoa nhài', 'Vải thiều tươi dầm', 'Đường', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80',
        featured: true
    },
    {
        id: 'tra-dao-dam',
        name: 'Trà Đào Dầm',
        price: 20000,
        categoryId: 2,
        category: 'Trà & Trái Cây',
        desc: 'Trà đào cổ điển với đào ngâm dầm nhuyễn. Vị ngọt thanh, thơm hương đào tự nhiên, là best-seller mùa hè.',
        ingredients: ['Trà đen', 'Đào ngâm dầm', 'Siro đào', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80',
        featured: true
    },
    {
        id: 'tra-mang-cau',
        name: 'Trà Mãng Cầu',
        price: 20000,
        categoryId: 2,
        category: 'Trà & Trái Cây2',
        desc: 'Trà kết hợp mãng cầu (na) tươi xay nhuyễn. Vị ngọt tự nhiên, thơm lừng, mang hương vị nhiệt đới đặc trưng.',
        ingredients: ['Trà xanh', 'Mãng cầu tươi', 'Đường', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=600&q=80',
        featured: true
    },
    {
        id: 'tra-nho-viet-quat',
        name: 'Trà Nho Việt Quất',
        price: 20000,
        categoryId: 2,
        category: 'Trà & Trái Cây',
        desc: 'Trà hoa nhài hòa quyện cùng nho và việt quất tươi. Màu tím đẹp mắt, vị chua ngọt hài hòa, giàu chất chống oxy hóa.',
        ingredients: ['Trà hoa nhài', 'Nho tươi', 'Việt quất', 'Đường', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80',
        featured: false
    },

    // ========== 3. NHÓM CACAO, MATCHA & SỮA ==========
    {
        id: 'milo-sua-dam',
        name: 'Milo Sữa Dầm',
        price: 18000,
        categoryId: 3,
        category: 'Cacao & Matcha',
        desc: 'Milo đậm đà pha cùng sữa đặc và sữa tươi, dầm mịn tạo nên hương vị thơm béo. Tuổi thơ dữ dội trong từng ngụm.',
        ingredients: ['Milo', 'Sữa đặc', 'Sữa tươi', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'cacao-sua-da',
        name: 'Cacao Sữa Đá',
        price: 22000,
        categoryId: 3,
        category: 'Cacao & Matcha',
        desc: 'Bột cacao nguyên chất pha cùng sữa đặc và đá viên. Hương chocolate đậm đà, ngọt vừa, mát lạnh sảng khoái.',
        ingredients: ['Bột cacao nguyên chất', 'Sữa đặc', 'Đường', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'cacao-kem-muoi',
        name: 'Cacao Kem Muối',
        price: 25000,
        categoryId: 3,
        category: 'Cacao & Matcha',
        desc: 'Cacao đậm đà phủ lớp kem muối béo ngậy trên cùng. Sự kết hợp hoàn hảo giữa vị ngọt chocolate và mặn nhẹ của kem muối.',
        ingredients: ['Bột cacao nguyên chất', 'Kem whipping', 'Muối biển', 'Sữa đặc', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'matcha-sua-dua',
        name: 'Matcha Sữa Dừa',
        price: 28000,
        categoryId: 3,
        category: 'Cacao & Matcha',
        desc: 'Matcha Nhật Bản kết hợp nước cốt dừa béo thơm. Hương vị thanh mát của trà xanh hòa quyện cùng dừa nhiệt đới.',
        ingredients: ['Bột matcha Nhật Bản', 'Nước cốt dừa', 'Sữa đặc', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80',
        featured: true
    },
    {
        id: 'matcha-sua-da',
        name: 'Matcha Sữa Đá',
        price: 25000,
        categoryId: 3,
        category: 'Cacao & Matcha',
        desc: 'Matcha Nhật Bản pha cùng sữa tươi và sữa đặc. Vị trà xanh đậm đà, thanh mát, tốt cho sức khỏe.',
        ingredients: ['Bột matcha Nhật Bản', 'Sữa tươi', 'Sữa đặc', 'Đá viên'],
        image: 'IMG/matcha.jpg',
        featured: false
    },
    {
        id: 'sam-dua-sua',
        name: 'Sâm Dứa Sữa',
        price: 15000,
        categoryId: 3,
        category: 'Cacao & Matcha',
        desc: 'Nước sâm dứa (lá dứa) thơm mát kết hợp sữa đặc. Thức uống thanh nhiệt, giải độc, mang hương vị truyền thống.',
        ingredients: ['Nước sâm dứa (lá dứa)', 'Sữa đặc', 'Đường', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
        featured: false
    },

    // ========== 4. NHÓM SODA & SỮA CHUA ==========
    {
        id: 'soda-chanh-day',
        name: 'Soda Chanh Dây',
        price: 15000,
        categoryId: 4,
        category: 'Soda & Sữa Chua',
        desc: 'Soda sủi tăm mát lạnh kết hợp chanh dây (passion fruit) chua ngọt. Sảng khoái, giải nhiệt tức thì.',
        ingredients: ['Soda', 'Chanh dây tươi', 'Đường', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'soda-viet-quat',
        name: 'Soda Việt Quất',
        price: 16000,
        categoryId: 4,
        category: 'Soda & Sữa Chua',
        desc: 'Soda sủi bọt mát lạnh hòa quyện cùng siro việt quất tím đẹp mắt. Tươi mới, bắt mắt và cực kỳ giải khát.',
        ingredients: ['Soda', 'Siro việt quất', 'Việt quất tươi', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80',
        featured: false
    },
    {
        id: 'sua-chua-viet-quat',
        name: 'Sữa Chua Việt Quất',
        price: 25000,
        categoryId: 4,
        category: 'Soda & Sữa Chua',
        desc: 'Sữa chua mịn mát kết hợp việt quất tươi. Vị chua nhẹ hài hòa, bổ dưỡng và tốt cho hệ tiêu hóa.',
        ingredients: ['Sữa chua', 'Việt quất tươi', 'Siro việt quất', 'Đá viên'],
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
        featured: false
    }
];

