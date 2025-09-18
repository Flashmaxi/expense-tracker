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
        password TEXT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        resetToken TEXT,
        resetTokenExpiry INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
        return;
      }

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
      `, (err) => {
        if (err) {
          console.error('Error creating categories table:', err);
          return;
        }

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
        `, (err) => {
          if (err) {
            console.error('Error creating transactions table:', err);
            return;
          }

          // Insert default categories after all tables are created
          this.insertDefaultCategories();
        });
      });
    });
  }

  private insertDefaultCategories(): void {
    // Create default user and categories for single-user setup
    this.createDefaultUser();
  }

  private createDefaultUser(): void {
    // Check if default user already exists
    this.db.get('SELECT id FROM users WHERE id = 1', [], (err, row) => {
      if (err) {
        console.error('Error checking for default user:', err);
        return;
      }

      if (!row) {
        // Create default user without password (will be set on first setup)
        this.db.run(
          `INSERT INTO users (id, email, password, firstName, lastName)
           VALUES (1, 'user@localhost', NULL, 'Personal', 'User')`,
          [],
          (err) => {
            if (err) {
              console.error('Error creating default user:', err);
              return;
            }
            console.log('Default user created');
            this.createDefaultCategoriesForUser(1);
          }
        );
      } else {
        console.log('Default user already exists');
      }
    });
  }

  private createDefaultCategoriesForUser(userId: number): void {
    const defaultCategories = [
      { name: 'Food & Dining', type: 'expense', color: '#EF4444' },
      { name: 'Transportation', type: 'expense', color: '#F97316' },
      { name: 'Shopping', type: 'expense', color: '#EAB308' },
      { name: 'Entertainment', type: 'expense', color: '#8B5CF6' },
      { name: 'Bills & Utilities', type: 'expense', color: '#06B6D4' },
      { name: 'Healthcare', type: 'expense', color: '#EC4899' },
      { name: 'Salary', type: 'income', color: '#10B981' },
      { name: 'Freelance', type: 'income', color: '#059669' },
      { name: 'Investment', type: 'income', color: '#0D9488' },
      { name: 'Other Income', type: 'income', color: '#0891B2' },
    ];

    defaultCategories.forEach(cat => {
      this.db.run(
        'INSERT INTO categories (name, type, color, userId) VALUES (?, ?, ?, ?)',
        [cat.name, cat.type, cat.color, userId],
        (err) => {
          if (err && !err.message.includes('UNIQUE constraint failed')) {
            console.error('Error creating category:', err);
          }
        }
      );
    });
    console.log('Default categories created');
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