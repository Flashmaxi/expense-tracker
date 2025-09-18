import { Database } from 'sqlite3';
import DatabaseManager from './database';

export interface Transaction {
  id?: number;
  amount: number;
  description?: string;
  type: 'income' | 'expense';
  categoryId?: number;
  userId: number;
  date: string;
  bitcoinPrice?: number;
  satoshiAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  categoryName?: string;
  categoryColor?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  total: number;
  count: number;
  percentage: number;
}

export class TransactionModel {
  private db: Database;

  constructor() {
    this.db = DatabaseManager.getInstance().getDatabase();
  }

  public create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO transactions (amount, description, type, categoryId, userId, date, bitcoinPrice, satoshiAmount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        transaction.amount,
        transaction.description,
        transaction.type,
        transaction.categoryId,
        transaction.userId,
        transaction.date,
        transaction.bitcoinPrice,
        transaction.satoshiAmount
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  public findByUserId(userId: number, limit?: number, offset?: number): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT t.*, c.name as categoryName, c.color as categoryColor
        FROM transactions t
        LEFT JOIN categories c ON t.categoryId = c.id
        WHERE t.userId = ?
        ORDER BY t.date DESC, t.createdAt DESC
      `;

      const params: any[] = [userId];

      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
        if (offset) {
          query += ' OFFSET ?';
          params.push(offset);
        }
      }

      this.db.all(query, params, (err, rows: Transaction[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  public findById(id: number): Promise<Transaction | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.*, c.name as categoryName, c.color as categoryColor
        FROM transactions t
        LEFT JOIN categories c ON t.categoryId = c.id
        WHERE t.id = ?
      `;

      this.db.get(query, [id], (err, row: Transaction) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public update(id: number, transaction: Partial<Transaction>): Promise<void> {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (transaction.amount !== undefined) {
        fields.push('amount = ?');
        values.push(transaction.amount);
      }
      if (transaction.description !== undefined) {
        fields.push('description = ?');
        values.push(transaction.description);
      }
      if (transaction.categoryId !== undefined) {
        fields.push('categoryId = ?');
        values.push(transaction.categoryId);
      }
      if (transaction.date !== undefined) {
        fields.push('date = ?');
        values.push(transaction.date);
      }

      if (fields.length === 0) {
        resolve();
        return;
      }

      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`;

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
      const query = 'DELETE FROM transactions WHERE id = ?';

      this.db.run(query, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public getSummary(userId: number, startDate?: string, endDate?: string): Promise<TransactionSummary> {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpenses,
          COUNT(*) as transactionCount
        FROM transactions
        WHERE userId = ?
      `;

      const params: any[] = [userId];

      if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }

      this.db.get(query, params, (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          const totalIncome = row.totalIncome || 0;
          const totalExpenses = row.totalExpenses || 0;
          resolve({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            transactionCount: row.transactionCount || 0
          });
        }
      });
    });
  }

  public getCategorySummary(userId: number, type: 'income' | 'expense', startDate?: string, endDate?: string): Promise<CategorySummary[]> {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT
          c.id as categoryId,
          c.name as categoryName,
          c.color as categoryColor,
          SUM(t.amount) as total,
          COUNT(t.id) as count
        FROM transactions t
        JOIN categories c ON t.categoryId = c.id
        WHERE t.userId = ? AND t.type = ?
      `;

      const params: any[] = [userId, type];

      if (startDate) {
        query += ' AND t.date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND t.date <= ?';
        params.push(endDate);
      }

      query += ' GROUP BY c.id, c.name, c.color ORDER BY total DESC';

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const totalAmount = rows.reduce((sum, row) => sum + row.total, 0);
          const result = rows.map(row => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            categoryColor: row.categoryColor,
            total: row.total,
            count: row.count,
            percentage: totalAmount > 0 ? (row.total / totalAmount) * 100 : 0
          }));
          resolve(result);
        }
      });
    });
  }

  public getMonthlyTrends(userId: number, months: number = 12): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM transactions
        WHERE userId = ? AND date >= date('now', '-${months} months')
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month
      `;

      this.db.all(query, [userId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
}