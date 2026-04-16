INSERT INTO categories (name, description) VALUES
('Nhang Trầm', 'Các loại nhang trầm hương'),
('Vòng Trầm', 'Các loại vòng tay trầm hương'),
('Phụ Kiện Trầm', 'Phụ kiện và quà tặng từ trầm hương');

INSERT INTO products (category_id, name, slug, description, price, stock, image_url, is_featured) VALUES
(1, 'Nhang Trầm Cao Cấp', 'nhang-tram-cao-cap', 'Nhang trầm hương thơm dịu, phù hợp thờ cúng và thư giãn.', 120000, 50, 'https://via.placeholder.com/300', true),
(2, 'Vòng Tay Trầm 108 Hạt', 'vong-tay-tram-108-hat', 'Vòng tay trầm hương 108 hạt, mùi thơm tự nhiên.', 350000, 30, 'https://via.placeholder.com/300', true),
(3, 'Đế Cắm Nhang Gỗ', 'de-cam-nhang-go', 'Đế cắm nhang gỗ tiện dụng, thiết kế đẹp.', 80000, 20, 'https://via.placeholder.com/300', false);