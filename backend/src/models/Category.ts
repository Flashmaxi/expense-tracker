import { Database } from 'sqlite3';
import DatabaseManager from './database';

export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  userId: number;
  createdAt?: string;
}

export class CategoryModel {
  private db: Database;

  constructor() {
    this.db = DatabaseManager.getInstance().getDatabase();
  }

  public create(category: Omit<Category, 'id' | 'createdAt'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO categories (name, type, color, userId)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(query, [category.name, category.type, category.color, category.userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  public findByUserId(userId: number): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM categories WHERE userId = ? ORDER BY name';

      this.db.all(query, [userId], (err, rows: Category[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  public findById(id: number): Promise<Category | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM categories WHERE id = ?';

      this.db.get(query, [id], (err, row: Category) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public update(id: number, category: Partial<Category>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (category.name) {
        fields.push('name = ?');
        values.push(category.name);
      }
      if (category.color) {
        fields.push('color = ?');
        values.push(category.color);
      }

      if (fields.length === 0) {
        resolve();
        return;
      }

      values.push(id);
      const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;

      this.db.run(query, values, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public delete(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM categories WHERE id = ?';

      this.db.run(query, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public createDefaultCategories(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
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

      const promises = defaultCategories.map(cat =>
        this.create({ ...cat, userId, type: cat.type as 'income' | 'expense' })
      );

      Promise.all(promises)
        .then(() => resolve())
        .catch(reject);
    });
  }
}