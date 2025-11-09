-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 26, 2025 at 07:57 AM
-- Server version: 8.0.30
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `roti_kopi_co`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `customer_phone` varchar(15) DEFAULT NULL,
  `nomor_antrian` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tipe_pesanan` enum('dine_in','take_away') NOT NULL,
  `waktu_pesan` datetime DEFAULT CURRENT_TIMESTAMP,
  `waktu_selesai` datetime DEFAULT NULL,
  `status` enum('pending','processing','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `total_harga` decimal(10,2) NOT NULL,
  `notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `detail_id` int NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `jumlah` int NOT NULL,
  `harga_satuan` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `history_id` int NOT NULL,
  `order_id` int NOT NULL,
  `status` enum('pending','processing','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `changed_by` int DEFAULT NULL,
  `notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` varchar(255) NOT NULL,
  `order_id` int NOT NULL,
  `metode` enum('cash','qris','kartu') NOT NULL,
  `jumlah_bayar` decimal(10,2) NOT NULL,
  `status` enum('paid','unpaid','pending','expired','cancelled','failed') DEFAULT 'unpaid',
  `created_by` int DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `waktu_bayar` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` int NOT NULL,
  `permission_name` varchar(50) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_name`, `description`) VALUES
(1, 'manage_products', 'Mengelola produk (tambah, edit, hapus)'),
(2, 'manage_promos', 'Mengelola promo'),
(3, 'view_reports', 'Melihat laporan'),
(4, 'manage_orders', 'Mengelola pesanan'),
(5, 'manage_users', 'Mengelola pengguna'),
(6, 'place_orders', 'Membuat pesanan'),
(7, 'view_orders', 'Melihat pesanan sendiri');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `deskripsi` text,
  `harga` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `discount_percent` int DEFAULT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `subkategori` varchar(50) DEFAULT NULL,
  `status` enum('available','unavailable') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'available',
  `is_promo` tinyint(1) DEFAULT '0',
  `valid_until` date DEFAULT NULL,
  `gambar_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `nama`, `deskripsi`, `harga`, `original_price`, `discount_percent`, `kategori`, `subkategori`, `status`, `is_promo`, `valid_until`, `gambar_url`) VALUES
(1, 'Combo Meal 1', 'Cheese Topped Latte Gula Aren + Almond Croissant', '49600.00', '62000.00', 20, 'combo', NULL, 'available', 1, '2025-10-25', 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680119/combo_meal_1_hk4bzl.jpg'),
(2, 'Combo Meal 2', 'Pumpkin Spice Latte + Beef & Cheese Sandwich', '53600.00', '67000.00', 20, 'combo', NULL, 'available', 1, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680109/combo_meal_2_fo4ytr.jpg'),
(3, 'Combo Meal 3', 'Signature Chocolate + Ovomaltine Flash Bread', '37600.00', '47000.00', 20, 'combo', NULL, 'available', 1, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680116/combo_meal_3_g6d2op.jpg'),
(4, 'Combo Meal 4', 'Peach Citrus Refresher + Spicy Croque Monsieur', '44000.00', '55000.00', 20, 'combo', NULL, 'available', 1, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680115/combo_meal_4_t0c0ta.jpg'),
(5, 'Combo Meal 5', 'Cheese Topped Pumpkin Spice Latte + Almond Croissant', '49600.00', '62000.00', 20, 'combo', NULL, 'available', 1, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680111/combo_meal_5_oyx53m.jpg'),
(6, 'Combo for Two', '1 Milk Tea & 1 Latte + 1 Beef Cheese Sandwich & Spicy Croque Monsieur', '86000.00', '107500.00', 20, 'combo', NULL, 'available', 1, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680114/combo_for_two_lwpcqy.jpg'),
(7, 'Combo Tasty Trio', '1 Milk Tea & 1 Latte & 1 Cheese Topped Latte Gula Aren + 1 Ovomaltine Flash Bread & 1 Butter Croissant & 1 Almond Croissant', '117200.00', '146500.00', 20, 'combo', NULL, 'available', 1, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680112/combo_tasty_trio_lmshmd.jpg'),
(8, 'Combo Double Bottle', '2 Americano', '145800.00', '162000.00', 10, 'combo', NULL, 'available', 1, '2025-10-15', 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680109/combo_bottle_hepx5w.jpg'),
(9, 'Cheese Topped Pumpkin Spice Latte', 'Delicate pumpkin flavor blended with warm spices and topped with fluffy cheese foam for the perfect sweet and salty balance', '36000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678017/cheese_topped_pumpkin_spice_latte_zrekgv.jpg'),
(10, 'Pumpkin Spice Latte', 'Delicate pumpkin flavor blended with warm spices and topped for the perfect sweet and salty balance', '30000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678017/pumpkin_spice_latte_df7qst.jpg'),
(11, 'Cheese Topped Latte Gula Aren', 'Sweet Palm Sugar Latte with a touch of creamy cheese foam', '33000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678010/cheese_topped_latte_gula_aren_kscekt.jpg'),
(12, 'Cheese Topped Macadamia Latte', 'Smooth Macadamia Latte with a touch of creamy cheese foam', '36000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678010/cheese_topped_macadamia_latte_ikvsfk.jpg'),
(13, 'Latte Gula Aren', 'A flavorful latte with aren sugar', '27000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678010/latte_gula_aren_eetata.jpg'),
(14, 'Seasalt Latte Gula Aren', 'Coffee milk with palm sugar and sea salt experience', '32500.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678009/seasalt_latte_gula_aren_ckuvr2.jpg'),
(15, 'Macadamia Latte', 'Coffee milk with premium macadamia nut syrup', '30000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678008/macadamia_latte_qvblet.jpg'),
(16, 'Chocolate Rose Latte', 'Blend of velvety chocolate and rose syrup, with rose flakes on top', '32500.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678003/chocolate_rose_latte_dxye18.jpg'),
(17, 'Yuzu Americano', 'Americano with refreshing yuzu flavour', '25000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678002/yuzu_americano_uem2pl.jpg'),
(18, 'Espresso', 'Espresso with strong Arabica coffee beans', '18000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678001/espresso_iaqw5l.jpg'),
(19, 'Americano', 'Espresso and hot water', '19500.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678000/americano_iml7fy.jpg'),
(20, 'Mint & Lime Americano', 'Americano with refreshing mint & lime flavour', '25000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758678000/mint_lime_americano_mcbq7h.jpg'),
(21, 'Mint & Lime Espresso Tonic', 'Espresso and sparkling tonic water with refreshing mint & lime flavour', '31000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677999/mint_lime_espresso_tonic_obejr4.jpg'),
(22, 'Yuzu Espresso Tonic', 'Espresso and sparkling tonic water with refreshing yuzu flavour', '31000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677998/yuzu_espresso_tonic_eabnso.jpg'),
(23, 'Cappucino', 'The best blend of espresso with steamed milk, topped with thick milk foam', '26000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677987/cappucino_bfg7tm.jpg'),
(24, 'Caramel Macchiato', 'A blend of espresso with milk, vanilla syrup and caramel sauce', '32000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677986/caramel_macchiato_touoph.jpg'),
(25, 'Latte', 'A blend of espresso and steamed milk', '24000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677986/latte_gca7pc.jpg'),
(26, 'Vanilla Latte', 'Latte with a vanilla flavor that will make your taste buds happy', '30000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677985/vanilla_latte_ghfuxz.jpg'),
(27, 'Honey Latte', 'Blend of creamy latte with sweet honey', '32000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677985/honey_latte_h7olrd.jpg'),
(28, 'Butterscotch Latte', 'A blend of espresso with milk, whipped cream, and butterscotch syrup.', '32000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677985/butterscotch_latte_beeamk.jpg'),
(29, 'Classic Matcha Latte', 'A creamy blend of matcha flavors, mixed with espresso', '32500.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677984/classic_matcha_latte_coffee_p7sx10.jpg'),
(30, 'Butterscotch Americano', 'Americano with sweet butterscotch flavour', '27000.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677984/butterscotch_americano_luyqpp.jpg'),
(31, 'Butterscotch Matcha Latte', 'Typical matcha with a touch of smooth butterscotch with caramel sauce', '34500.00', NULL, NULL, 'coffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758677984/butterscotch_matcha_latte_awi57f.jpg'),
(32, 'Chamomile Flower Tea', 'Tea with soothing aroma and delicate flavor of chamomile', '26000.00', NULL, NULL, 'tea', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676062/chamomile_flower_tea_pxu7v7.jpg'),
(33, 'English Breakfast Tea', 'Classic and bold english breakfast tea', '26000.00', NULL, NULL, 'tea', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676061/english_breakfast_tea_dx1rnn.jpg'),
(34, 'Lemon Lychee Ice Tea', 'Refreshing lemon ice tea with lychee flavour', '26000.00', NULL, NULL, 'tea', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676060/lemon_lychee_ice_tea_tqorem.jpg'),
(35, 'Earl Grey Milk Tea', 'Earl grey tea with creamy milk', '26000.00', NULL, NULL, 'tea', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676048/earl_grey_mikl_tea_szjfst.jpg'),
(36, 'Blue Butterfly Pea Milk Tea', 'Milk and tea infused with butterfly pea flower petals', '31000.00', NULL, NULL, 'tea', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676058/blue_butterfly_pea_milk_tea_o1mq7n.jpg'),
(37, 'Milk Tea', 'Creamy blend of tea and milk', '18500.00', NULL, NULL, 'tea', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676051/milk_tea_aiiffr.jpg'),
(38, 'Peach Citrus Refresher', 'A fresh combination of peach and citrus for a refreshing drink.', '27000.00', NULL, NULL, 'nonCoffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676050/peach_citrus_refresher_ithe9o.jpg'),
(39, 'Yuzu Strawberry Refresher', 'A combination of fresh yuzu and sweet strawberries for a delicious refreshment.', '27000.00', NULL, NULL, 'nonCoffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676049/yuzu_strawberry_refresher_duycgm.jpg'),
(40, 'Mango Energy Boost', 'Energy drink mixed with creamy mango flavor that increases energy', '31000.00', NULL, NULL, 'nonCoffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676048/mango_energy_boost_rmlacy.jpg'),
(41, 'Strawberry Energy Boost', 'Energy drink mixed with creamy strawberry flavor that increases energy', '31000.00', NULL, NULL, 'nonCoffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676049/strawberry_energy_boost_pj9dki.jpg'),
(42, 'Lychee Yakult Soda with Popping Boba', 'Refreshing blend of lychee, yakult, with the zesty burst of popping boba mango', '32000.00', NULL, NULL, 'nonCoffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676049/lychee_yakult_soda_with_popping_boba_mtcsnx.jpg'),
(43, 'Mineral Water', 'Bottled mineral water', '12000.00', NULL, NULL, 'nonCoffee', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758676048/mineral_water_httrzw.jpg'),
(44, 'Grilled Cheese Toast', 'Two types of cheese on whole wheat sourdough bread spread with butter', '36000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680039/grilled_cheese_toast_h8v6ie.jpg'),
(45, 'Pesto and Tomato Toast', 'Fresh and tart tomato puree combined with flavorful pesto, on buttered whole wheat sourdough bread', '34000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680037/pesto_and_tomato_toast_wgbfch.jpg'),
(46, 'Beef Brisket and Cheese Toast', 'Beef brisket with two types of cheese, served on soft whole wheat sourdough bread spread with butter', '36000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680037/beef_brisket_and_cheese_toast_nsz17p.jpg'),
(47, 'Smoked Chicken Croissant Sandwich', 'Crispy and soft croissant filled with smoked chicken and cheese with bechamel sauce', '37000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680036/smoked_chicken_croissant_sandwich_thcse6.jpg'),
(48, 'Salmon Bagel', 'Savory bagel with salmon spread filling', '32000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680032/salmon_bagel_uiw9qr.jpg'),
(49, 'English Muffin & Cheese Sandwich', 'Classic sandwich with egg, chicken ham, melted cheese and soft English muffin', '38000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680032/english_muffin_cheese_sandwich_ic2adc.jpg'),
(50, 'Spicy Croque Monsieur', 'Bread filled with smoked meat with melted cheese and bechamel sauce', '28000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680031/spicy_croque_monsieur_toast_k00bk8.jpg'),
(51, 'Beef & Cheese Sandwich', 'A sandwich filled with a mixture of premium beef and cheese that is super delicious and enjoyable.', '37000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680031/beef_and_sandwich_toast_imefvu.jpg'),
(52, 'Cheese Garlic Bread', 'The bread is soft and tender with a layer of roasted garlic butter and cheese', '25000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680030/cheese_garlic_bread_ut1ntj.jpg'),
(53, 'Ovomaltine Flash Bread', 'Bread filled with crunchy ovomaltine', '20000.00', NULL, NULL, 'bread', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680030/ovomaltine_bread_r5pnjm.jpg'),
(54, 'Mixed Berries Granola Bowl', 'Mixed berries granola bowl', '36000.00', NULL, NULL, 'bites', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680095/mixed_berries_granola_bowl_bjkszr.jpg'),
(55, 'Mango Coconut Granola Bowl', 'Mango coconut granola bowl', '36000.00', NULL, NULL, 'bites', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680095/mango_coconut_granola_bowl_yx3poe.jpg'),
(56, 'Nuts and Raisins Granola Bowl', 'Nuts and raisins granola bowl', '35000.00', NULL, NULL, 'bites', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680093/nuts_and_raisins_garnola_bowl_guscr7.jpg'),
(57, 'Milk Chocolate Brownie', 'Soft and fudgy brownies', '25000.00', NULL, NULL, 'bites', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680091/milk_chocolate_brownie_bybcgn.jpg'),
(58, 'Chocolate Muffin', 'Soft and delicious chocolate cheese muffins', '32000.00', NULL, NULL, 'bites', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758680091/chocolate_muffin_vzv8xh.jpg'),
(59, 'Pumpkin Spice Latte (1L)', 'Delicate pumpkin flavor blended with warm spices and topped for the perfect sweet and salty balance', '96000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679368/pumpkin_spice_latte_1l_lgyn0r.jpg'),
(60, 'Cheese Topped Pumpkin Spice Latte (1L)', 'Delicate pumpkin flavor blended with warm spices and topped with fluffy cheese foam for the perfect sweet and salty balance', '104000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679367/cheese_topped_pumpkin_spice_latte_1l_oalmpa.jpg'),
(61, 'Cheese Topped Latte Gula Aren (1L)', 'Sweet Palm Sugar Latte with a touch of creamy cheese foam', '98000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679367/cheese_topped_latte_gula_aren_1l_cafs6p.jpg'),
(62, 'Cheese Topped Macadamia Latte (1L)', 'Smooth Macadamia Latte with a touch of creamy cheese foam', '104000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679366/cheese_topped_macadamia_latte_1l_hwcifq.jpg'),
(63, 'Latte Gula Aren (1L)', 'A flavorful latte with aren sugar', '90000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679366/latte_gula_aren_1l_ydjsby.jpg'),
(64, 'Seasalt Latte Gula Aren (1L)', 'Coffee milk with palm sugar and sea salt experience', '98000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679365/seasalt_latte_gula_aren_1l_kpfy5j.jpg'),
(65, 'Macadamia Latte (1L)', 'Coffee milk with premium macadamia nut syrup', '96000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679365/macadamia_latte_1l_m3ux1x.jpg'),
(66, 'Lychee Yakult Soda with Popping Boba (1L)', 'Refreshing blend of lychee, yakult, with the zesty burst of popping boba mango', '102000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679364/lychee_yakult_soda_with_popping_boba_1l_tteawy.jpg'),
(67, 'Chocolate Rose Latte (1L)', 'Blend of velvety chocolate and rose syrup, with rose flakes on top', '102000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679364/chocolate_rose_latte_1l_zdi5bj.jpg'),
(68, 'Whipped Strawberry Matcha (1L)', 'A refreshing blend of premium matcha with sweet, fluffy strawberry whipped cream. Beautifully layered, uniquely delicious, and perfectly creamy yet refreshing', '104000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679364/whipped_strawberry_matcha_1l_bb2zg3.jpg'),
(69, 'Yuzu Americano (1L)', 'Americano with refreshing yuzu flavour', '87000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679363/yuzu_americano_1l_svqvxy.jpg'),
(70, 'Americano (1L)', 'Espresso and hot water', '81000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679363/americano_1l_auvqwn.jpg'),
(71, 'Latte (1L)', 'A blend of espresso and steamed milk', '90000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679362/latte_1l_cum9tj.jpg'),
(72, 'Butterscotch Americano (1L)', 'Americano with sweet butterscotch flavour', '89000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679362/butterscotch_americano_1l_nrr9cu.jpg'),
(73, 'Cappucino (1L)', 'The best blend of espresso with steamed milk, topped with thick milk foam', '91000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679362/cappuccino_1l_vhuzru.jpg'),
(74, 'Caramel Macchiato 1(1L)', 'A blend of espresso with milk, vanilla syrup and caramel sauce', '98000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679362/caramel_macchiato_1l_vjqzbw.jpg'),
(75, 'Chocolate Macadamia Bliss', 'A heavenly fusion of rich chocolate and crunchy macadamia, crafted into a perfectly indulgent drink. Smooth, nutty, and irresistibly delightful', '96000.00', NULL, NULL, 'bottled', NULL, 'available', 0, NULL, 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1758679361/chocolate_macadamia_bliss_1l_jkgunx.jpg'),
(77, 'Testing', 'testing', '20000.00', '20000.00', NULL, 'coffee', NULL, 'available', 0, NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `promo_products`
--

CREATE TABLE `promo_products` (
  `promo_product_id` int NOT NULL,
  `product_id` int NOT NULL,
  `required_quantity` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_permission_id` int NOT NULL,
  `role` enum('admin','kasir','pelanggan') NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_permission_id`, `role`, `permission_id`) VALUES
(1, 'admin', 1),
(2, 'admin', 2),
(3, 'admin', 3),
(4, 'admin', 4),
(5, 'admin', 5),
(6, 'admin', 6),
(7, 'admin', 7),
(8, 'kasir', 4),
(9, 'kasir', 6),
(10, 'kasir', 7),
(11, 'pelanggan', 6),
(12, 'pelanggan', 7);

-- --------------------------------------------------------

--
-- Table structure for table `special_events`
--

CREATE TABLE `special_events` (
  `event_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `price` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `button_text` varchar(50) DEFAULT 'Book Now',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `special_events`
--

INSERT INTO `special_events` (`event_id`, `title`, `price`, `description`, `image_url`, `button_text`, `is_active`, `created_at`) VALUES
(1, 'Birthday Package', 'Start from Rp. 740.000/20 pax', 'Rayakan hari spesial dengan paket ulang tahun eksklusif kami, termasuk dekorasi tema, kue ulang tahun, serta pilihan roti dan minuman favorit untuk melengkapi momen berharga Anda.', 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1759058077/1_akc9lx.png', 'Inquire Now', 1, '2025-09-16 19:24:44'),
(2, 'Big Order', 'Custom Quote Available', 'Roti & Kopi Co menghadirkan paket khusus bagi Anda yang ingin memesan dalam jumlah besar untuk berbagai acara, mulai dari perusahaan, pernikahan, hingga pertemuan keluarga.', 'https://res.cloudinary.com/dg2r9uhsf/image/upload/v1759058058/2_ko4iju.png', 'Inquire Now', 1, '2025-09-16 19:24:44');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `nomor_telepon` varchar(15) NOT NULL,
  `role` enum('admin','kasir','pelanggan') DEFAULT 'pelanggan',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `nama`, `email`, `password_hash`, `nomor_telepon`, `role`, `created_at`, `last_login`, `is_active`) VALUES
(1, 'Administrator', 'admin@rotikopico.com', '$2a$12$qK.ilpOJJ0nWvaoYz9BFYurxm9.LCYVAIxuRs3xxaM6RnDSzL9sua', '628123456789', 'admin', '2025-09-17 17:23:05', '2025-10-01 15:17:17', 1),
(2, 'Kasir 1', 'kasir1@rotikopico.com', '$2a$12$DwXBxT7ZAYlDXsyOODKmaeSms9rJC.mDceV3VuYOt1a8AsNLs18Vu', '628987654321', 'kasir', '2025-09-17 17:23:05', '2025-10-01 15:17:42', 1),
(9, NULL, NULL, NULL, '6283821612483', 'pelanggan', '2025-10-01 15:18:03', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_otps`
--

CREATE TABLE `user_otps` (
  `otp_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `kode_otp` varchar(6) NOT NULL,
  `expired_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_otps`
--

INSERT INTO `user_otps` (`otp_id`, `user_id`, `kode_otp`, `expired_at`, `is_used`, `created_at`) VALUES
(22, 9, '622472', '2025-10-01 15:28:03', 0, '2025-10-01 15:18:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_waktu_pesan` (`waktu_pesan`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_order_details_order_id` (`order_id`),
  ADD KEY `idx_order_details_product_id` (`product_id`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_order_status_history_order_id` (`order_id`),
  ADD KEY `idx_order_status_history_status` (`status`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `fk_payments_created_by` (`created_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `idx_products_status` (`status`),
  ADD KEY `idx_products_kategori` (`kategori`);

--
-- Indexes for table `promo_products`
--
ALTER TABLE `promo_products`
  ADD PRIMARY KEY (`promo_product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `special_events`
--
ALTER TABLE `special_events`
  ADD PRIMARY KEY (`event_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `nomor_telepon` (`nomor_telepon`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `user_otps`
--
ALTER TABLE `user_otps`
  ADD PRIMARY KEY (`otp_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `detail_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `history_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `promo_products`
--
ALTER TABLE `promo_products`
  MODIFY `promo_product_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `role_permission_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `special_events`
--
ALTER TABLE `special_events`
  MODIFY `event_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_otps`
--
ALTER TABLE `user_otps`
  MODIFY `otp_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `promo_products`
--
ALTER TABLE `promo_products`
  ADD CONSTRAINT `promo_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_otps`
--
ALTER TABLE `user_otps`
  ADD CONSTRAINT `user_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
