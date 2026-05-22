import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addTransaction, updateTransaction, deleteTransaction, db } from '../db/database';
import { useAccounts } from '../db/hooks';
import { todayISO } from '../utils/dateUtils';
import toast from 'react-hot-toast';

export interface TransactionFormState {
  date: string;
  setDate: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  amount: string;
  setAmount: Dispatch<SetStateAction<string>>;
  type: 'debit' | 'credit';
  setType: (v: 'debit' | 'credit') => void;
  accountId: number | '';
  setAccountId: (v: number | '') => void;
  category: string;
  setCategory: (v: string) => void;
  loading: boolean;
  fetching: boolean;
  isEdit: boolean;
  expendAcc: ReturnType<typeof useAccounts>[number] | undefined;
  savingsAcc: ReturnType<typeof useAccounts>[number] | undefined;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function useTransactionForm(): TransactionFormState {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accounts = useAccounts();

  const isEdit = id !== undefined;

  const [date,        setDate]        = useState(todayISO());
  const [description, setDescription] = useState('');
  const [amount,      setAmount]      = useState('');
  const [type,        setType]        = useState<'debit' | 'credit'>('debit');
  const [accountId,   setAccountId]   = useState<number | ''>('');
  const [category,    setCategory]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(isEdit);

  const expendAcc  = accounts.find(a => a.type === 'expenditure');
  const savingsAcc = accounts.find(a => a.type === 'savings');

  // Derived: fall back to expenditure account when user hasn't manually chosen one yet
  const effectiveAccountId: number | '' = accountId !== '' ? accountId : (expendAcc?.id ?? '');

  useEffect(() => {
    if (!isEdit) return;

    // fetching is already initialised to `true` when isEdit is true (line 44)
    // All setState calls here are inside async .then()/.catch()/.finally() — no sync setState.
    db.transactions.get(Number(id))
      .then((tx) => {
        if (tx) {
          setDate(tx.date);
          setDescription(tx.description);
          setAmount(tx.amount.toString());
          setType(tx.type);
          setAccountId(tx.accountId);
          setCategory(tx.category || '');
        } else {
          toast.error('Transaction not found');
          navigate('/', { replace: true });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load transaction');
      })
      .finally(() => setFetching(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)    { toast.error('Enter a valid amount'); return; }
    if (!effectiveAccountId) { toast.error('Select an account'); return; }
    if (!description.trim()) { toast.error('Add a description'); return; }

    setLoading(true);
    try {
      const txData = {
        date,
        description: description.trim(),
        amount: amt,
        type,
        accountId: Number(effectiveAccountId),
        category: category.trim() || undefined,
      };

      if (isEdit) {
        await updateTransaction(Number(id), txData);
        toast.success('Entry updated ✓');
      } else {
        await addTransaction(txData);
        toast.success('Entry logged ✓');
      }
      navigate(-1);
    } catch (err) {
      toast.error('Failed to save. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    setLoading(true);
    try {
      await deleteTransaction(Number(id));
      toast.success('Entry deleted ✓');
      navigate(-1);
    } catch (err) {
      toast.error('Failed to delete. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    date, setDate,
    description, setDescription,
    amount, setAmount,
    type, setType,
    accountId: effectiveAccountId, setAccountId,
    category, setCategory,
    loading,
    fetching,
    isEdit,
    expendAcc,
    savingsAcc,
    handleSubmit,
    handleDelete,
  };
}
