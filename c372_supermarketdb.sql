-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: c372_supermarketdb
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `cartid` int NOT NULL AUTO_INCREMENT,
  `iduser` int NOT NULL,
  `productid` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_order` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_order` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cartid`),
  KEY `iduser` (`iduser`),
  KEY `productid` (`productid`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`),
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`productid`) REFERENCES `product` (`productId`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (16,1,2,3,'2025-12-02 05:19:45','2025-12-02 07:35:24'),(17,1,4,2,'2025-12-02 05:19:47','2025-12-02 07:35:25'),(19,1,1,23,'2025-12-04 04:38:50','2025-12-04 05:03:09'),(20,3,1,3,'2025-12-04 05:04:02','2025-12-04 05:04:02');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `paymentID` int NOT NULL AUTO_INCREMENT,
  `iduser` varchar(45) NOT NULL,
  `amount` double(10,2) DEFAULT NULL,
  `paymentdate` varchar(45) DEFAULT NULL,
  `method` enum('card','paynow') DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`paymentID`),
  UNIQUE KEY `transaction_id_UNIQUE` (`transaction_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,'1',18.00,'2025-12-02 12:14:29',NULL,'Pending',NULL),(2,'1',18.00,'2025-12-02 12:21:25',NULL,'Pending',NULL),(3,'1',18.00,'2025-12-02 12:33:41','paynow','Paid',NULL),(4,'1',18.00,'2025-12-02 12:38:22','paynow','Paid',NULL),(5,'1',18.00,'2025-12-02 12:39:32','paynow','Paid',NULL),(6,'1',18.00,'2025-12-02 12:45:01','paynow','Paid',NULL),(7,'1',18.00,'2025-12-02 12:50:19','paynow','Paid',NULL),(8,'2',69.00,'2025-12-02 13:07:09','paynow','Paid',NULL),(9,'1',43.50,'2025-12-02 13:18:36','paynow','Paid',NULL),(10,'3',13.50,'2025-12-04 13:04:40',NULL,'Pending',NULL);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `productId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `quantity` int NOT NULL,
  `price` double(10,3) NOT NULL,
  `category` enum('Fresh Produce','Bakery','Dairy & Eggs','Meat & Seafood','Frozen food','Beverages') NOT NULL,
  `image` varchar(500) NOT NULL,
  `weight` varchar(45) NOT NULL,
  `description` varchar(5000) NOT NULL,
  PRIMARY KEY (`productId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Broccoli',5000,4.500,'Fresh Produce','Brocoli.png','50g','Fresh broccoli from USA'),(2,'China Corn',100000,3.200,'Fresh Produce','20240717-BoilingCorn-AmandaSuarez-SEA-f80166320b364edbbea05d65e538e270.jpg','80g','Sweet corn from Japan'),(3,'Milo ',500,25.900,'Beverages','71k-RrZEwbL._SL1200_.jpg','2kg','From Australia'),(4,'Kai Lan',1000,3.500,'Fresh Produce','Picture 1-800x800.png','40g','Fresh from China\r\n'),(12,'HL Milk',5000,6.500,'Beverages','61pjVw9oASL._AC_UF1000,1000_QL80_.jpg','1kg','Freshly produce from Japan'),(13,'US Ribeye steak 200g',500,25.500,'Meat & Seafood','istockphoto-505207430-612x612.jpg','200g','Freshly imported from USA');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `iduser` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `number` int DEFAULT NULL,
  `password_hash` varchar(100) DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `role` enum('Customer','Admin') DEFAULT NULL,
  PRIMARY KEY (`iduser`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'sam','lame@gmail.com',99999999,'$2b$10$SLK3oxj3dYD1msJZm5D1WuGub/a0XbuWg7q8oYv30eSxNErG.eXYS','Male','2003-05-16','Customer'),(2,'admin','admin1@gmail.com',12345678,'$2b$10$JKtkTM8KQ8TQuXK6fi7PhOgI2QIsoZaeDAmcz7sm4V5yz47UXZtOq','Male','2003-05-16','Admin'),(3,'nick','blahblah@gmail.com',1234567890,'$2b$10$INH2xNViIX3B0HKL2QxcUejo3BI5MrYC/46EuC.flYV4OpLtvhTgW','Male','2003-05-16','Customer');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'c372_supermarketdb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-05 22:44:25
