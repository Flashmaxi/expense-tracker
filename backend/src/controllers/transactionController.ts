import { Response } from 'express';
import { TransactionModel } from '../models/Transaction';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import bitcoinPriceService from '../services/bitcoinPriceService';
import currencyService from '../services/currencyService';

const transactionModel = new TransactionModel();
const userModel = new UserModel();

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { amount, description, type, categoryId, date } = req.body;

    if (!amount || !type || !date) {
      return res.status(400).json({ error: 'Amount, type, and date are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be either income or expense' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Get user's currency preference
    const user = await userModel.findById(userId);
    const userCurrency = user?.currency || 'USD';

    // Get Bitcoin price for the transaction date in user's currency and calculate satoshis directly
    const bitcoinPrice = await bitcoinPriceService.getBitcoinPriceForDate(date, userCurrency);
    const satoshiAmount = bitcoinPriceService.currencyToSatoshis(parseFloat(amount), bitcoinPrice);

    const transactionId = await transactionModel.create({
      amount: parseFloat(amount),
      description,
      type,
      categoryId: categoryId || null,
      userId,
      date,
      bitcoinPrice,
      satoshiAmount
    });

    const transaction = await transactionModel.findById(transactionId);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const transactions = await transactionModel.findByUserId(userId, limitNum, offset);

    res.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        hasMore: transactions.length === limitNum
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const transaction = await transactionModel.findById(parseInt(id));

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { amount, description, categoryId, date } = req.body;

    const transaction = await transactionModel.findById(parseInt(id));

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0' });
      }
      updateData.amount = parseFloat(amount);

      // Recalculate Bitcoin data if amount or date changed
      const user = await userModel.findById(userId);
      const userCurrency = user?.currency || 'USD';
      const transactionDate = date || transaction.date;

      const bitcoinPrice = await bitcoinPriceService.getBitcoinPriceForDate(transactionDate, userCurrency);
      const satoshiAmount = bitcoinPriceService.currencyToSatoshis(parseFloat(amount), bitcoinPrice);

      updateData.bitcoinPrice = bitcoinPrice;
      updateData.satoshiAmount = satoshiAmount;
    }
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (date !== undefined) {
      updateData.date = date;

      // Recalculate Bitcoin data if date changed (even if amount didn't)
      if (amount === undefined) {
        const user = await userModel.findById(userId);
        const userCurrency = user?.currency || 'USD';

        const bitcoinPrice = await bitcoinPriceService.getBitcoinPriceForDate(date, userCurrency);
        const satoshiAmount = bitcoinPriceService.currencyToSatoshis(transaction.amount, bitcoinPrice);

        updateData.bitcoinPrice = bitcoinPrice;
        updateData.satoshiAmount = satoshiAmount;
      }
    }

    await transactionModel.update(parseInt(id), updateData);

    const updatedTransaction = await transactionModel.findById(parseInt(id));

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const transaction = await transactionModel.findById(parseInt(id));

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await transactionModel.delete(parseInt(id));

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactionSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const summary = await transactionModel.getSummary(
      userId,
      startDate as string,
      endDate as string
    );

    res.json({ summary });
  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategorySummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { type, startDate, endDate } = req.query;

    if (!type || (type !== 'income' && type !== 'expense')) {
      return res.status(400).json({ error: 'Type must be either income or expense' });
    }

    const summary = await transactionModel.getCategorySummary(
      userId,
      type as 'income' | 'expense',
      startDate as string,
      endDate as string
    );

    res.json({ summary });
  } catch (error) {
    console.error('Get category summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMonthlyTrends = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { months = 12 } = req.query;

    const trends = await transactionModel.getMonthlyTrends(userId, parseInt(months as string));

    res.json({ trends });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};