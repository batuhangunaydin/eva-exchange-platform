-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 07 Şub 2022, 23:24:22
-- Sunucu sürümü: 10.4.22-MariaDB
-- PHP Sürümü: 8.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `eva_exchange_demo`
--

CREATE DATABASE eva_exchange_demo;
-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `registeredshares`
--

CREATE TABLE `registeredshares` (
  `Id` int(11) NOT NULL,
  `traderId` int(11) NOT NULL,
  `ShareName` varchar(50) NOT NULL,
  `ShareCode` varchar(3) NOT NULL,
  `RegisteredAmount` double NOT NULL,
  `SharePrice` double NOT NULL,
  `TradeSide` varchar(10) NOT NULL,
  `LastUpdateDate` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `traders`
--

CREATE TABLE `traders` (
  `Id` int(11) NOT NULL,
  `Firstname` varchar(35) NOT NULL,
  `Lastname` varchar(35) NOT NULL,
  `Email` varchar(55) NOT NULL,
  `Password` varchar(64) NOT NULL,
  `Balance` double NOT NULL DEFAULT 0,
  `BlockedBalance` double NOT NULL DEFAULT 0,
  `RegisteredDate` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tablo döküm verisi `traders`
--

INSERT INTO `traders` (`Id`, `Firstname`, `Lastname`, `Email`, `Password`, `Balance`, `BlockedBalance`, `RegisteredDate`) VALUES
(1, 'Batuhan', 'Günaydın', 'batuhan@test.com', '123456', 100000, 0, '2022-02-06 02:44:37.000000'),
(2, 'Kübra', 'Günaydın', 'kubra@test.com', '123456', 100200, 0, '2022-02-06 02:44:31.331404'),
(3, 'Luna', 'Günaydın', 'luna@test.com', '123456', 50000, 0, '2022-02-06 02:44:58.070507'),
(4, 'Tarçın', 'Günaydın', 'tarcin@test.com', '123456', 90000, 0, '2022-02-06 02:45:16.414265');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `tradersportfolios`
--

CREATE TABLE `tradersportfolios` (
  `Id` int(11) NOT NULL,
  `traderId` int(11) NOT NULL,
  `ShareName` varchar(50) NOT NULL,
  `ShareCode` varchar(3) NOT NULL,
  `ShareAmount` double NOT NULL DEFAULT 0,
  `ShareBlockedAmount` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tablo döküm verisi `tradersportfolios`
--

INSERT INTO `tradersportfolios` (`Id`, `traderId`, `ShareName`, `ShareCode`, `ShareAmount`, `ShareBlockedAmount`) VALUES
(1, 1, 'EVA', 'EVA', 70, 0),
(2, 1, 'SkyNeb', 'SKY', 500, 0),
(3, 1, 'Tesla', 'TSL', 50, 0),
(4, 2, 'EVA', 'EVA', 850, 0),
(5, 2, 'Tesla', 'TSL', 100, 0),
(6, 2, 'McDonalds', 'MCD', 90, 0),
(7, 3, 'McDonalds', 'MCD', 120, 0),
(8, 3, 'Mercedes-Benz', 'MBE', 50, 0),
(9, 4, 'EVA', 'EVA', 50, 0),
(10, 4, 'Tesla', 'TSL', 180, 0),
(11, 4, 'McDonalds', 'MCD', 200, 0);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `transactionlogs`
--

CREATE TABLE `transactionlogs` (
  `Id` int(11) NOT NULL,
  `traderId` int(11) NOT NULL,
  `ShareCode` varchar(3) NOT NULL,
  `ShareAmount` double NOT NULL,
  `SharePrice` double NOT NULL,
  `TradeSide` varchar(10) NOT NULL,
  `Status` varchar(30) NOT NULL,
  `TransactionDate` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `registeredshares`
--
ALTER TABLE `registeredshares`
  ADD PRIMARY KEY (`Id`);

--
-- Tablo için indeksler `traders`
--
ALTER TABLE `traders`
  ADD PRIMARY KEY (`Id`);

--
-- Tablo için indeksler `tradersportfolios`
--
ALTER TABLE `tradersportfolios`
  ADD PRIMARY KEY (`Id`);

--
-- Tablo için indeksler `transactionlogs`
--
ALTER TABLE `transactionlogs`
  ADD PRIMARY KEY (`Id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `registeredshares`
--
ALTER TABLE `registeredshares`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `traders`
--
ALTER TABLE `traders`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Tablo için AUTO_INCREMENT değeri `tradersportfolios`
--
ALTER TABLE `tradersportfolios`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Tablo için AUTO_INCREMENT değeri `transactionlogs`
--
ALTER TABLE `transactionlogs`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
