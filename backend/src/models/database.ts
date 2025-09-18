import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database;

  private constructor() {
    const dbPath = path.join(__dirname, '../../database.sqlite');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getDatabase(): Database {
    return this.db;
  }

  private initializeTables(): void {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        resetToken TEXT,
        resetTokenExpiry INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        color TEXT DEFAULT '#3B82F6',
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Transactions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        categoryId INTEGER,
        userId INTEGER NOT NULL,
        date DATETIME NOT NULL,
        bitcoinPrice DECIMAL(10, 2),
        satoshiAmount INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories (id) ON DELETE SET NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Add Bitcoin columns to existing transactions table if they don't exist
    this.db.run(`ALTER TABLE transactions ADD COLUMN bitcoinPrice DECIMAL(10, 2)`, () => {});
    this.db.run(`ALTER TABLE transactions ADD COLUMN satoshiAmount INTEGER`, () => {});

    // Insert default categories
    this.insertDefaultCategories();
  }

  private insertDefaultCategories(): void {
    // We'll insert default categories when a user registers
    console.log('Database tables initialized');
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

export default DatabaseManager;