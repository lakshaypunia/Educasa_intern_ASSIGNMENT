-- School Management API — Database Schema
-- Run this script once on both your local MySQL and Aiven MySQL

-- Create the database (local only — Aiven provides 'defaultdb' by default)
CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255)  NOT NULL,
  address    VARCHAR(255)  NOT NULL,
  latitude   FLOAT         NOT NULL,
  longitude  FLOAT         NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);
