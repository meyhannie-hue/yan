-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 07, 2025 at 05:48 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `techyme`
--

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `points` int(11) DEFAULT 0,
  `networking_completed` tinyint(1) DEFAULT 0,
  `programming_completed` tinyint(1) DEFAULT 0,
  `systemunit_completed` tinyint(1) DEFAULT 0,
  `networking_hard_perfect` tinyint(1) DEFAULT 0,
  `programming_game_unloccked` tinyint(1) DEFAULT 0,
  `progress` text DEFAULT NULL,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`id`, `name`, `points`, `networking_completed`, `programming_completed`, `systemunit_completed`, `networking_hard_perfect`, `programming_game_unlocked`, `progress`, `system_medium_done`) VALUES
(13, 'aaaa', 5362, 0, 0, 0, 0, 0, '{\"networking_easy_perfect\":true}', 0),
(14, 'asd', 3064, 0, 0, 0, 0, 0, '{\"networking_easy_perfect\":true,\"networking_medium_perfect\":true}', 0),
(15, ',,', 3064, 0, 0, 0, 0, 0, '{\"networking_easy_perfect\":true,\"networking_medium_perfect\":true}', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
