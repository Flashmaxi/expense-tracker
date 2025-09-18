import { Database } from 'sqlite3';
import DatabaseManager from './database';

export interface User {
  id?: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  currency?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class UserModel {
  private db: Database;

  constructor() {
    this.db = DatabaseManager.getInstance().getDatabase();
  }

  public create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (email, password, firstName, lastName, currency)
        VALUES (?, ?, ?, ?, ?)
      `;

      this.db.run(query, [user.email, user.password, user.firstName, user.lastName, user.currency || 'USD'], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  public findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';

      this.db.get(query, [email], (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';

      this.db.get(query, [id], (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public updateResetToken(email: string, token: string, expiry: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users
        SET resetToken = ?, resetTokenExpiry = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE email = ?
      `;

      this.db.run(query, [token, expiry, email], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public updatePassword(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users
        SET password = ?, resetToken = NULL, resetTokenExpiry = NULL, updatedAt = CURRENT_TIMESTAMP
        WHERE email = ?
      `;

      this.db.run(query, [password, email], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public findByResetToken(token: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM users
        WHERE resetToken = ? AND resetTokenExpiry > ?
      `;
      const now = Date.now();

      this.db.get(query, [token, now], (err, row: User) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public updateCurrency(userId: number, currency: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users
        SET currency = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      this.db.run(query, [currency, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public hasPassword(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT password FROM users WHERE id = 1';

      this.db.get(query, [], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row && row.password !== null && row.password !== '');
        }
      });
    });
  }

  public setInitialPassword(password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users
        SET password = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = 1
      `;

      this.db.run(query, [password], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}