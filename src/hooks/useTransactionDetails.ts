import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteTransaction, type Transaction } from "../db/database";
import { updateSheetOpenState } from "../utils/modalHelper";

export function useTransactionDetails(tx: Transaction, onClose: () => void) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDelete = async () => {
    try {
      if (tx.id === undefined) return;
      await deleteTransaction(tx.id);
      toast.success("Transaction deleted successfully ✓");
      onClose();
    } catch (err) {
      toast.error("Failed to delete transaction");
      console.error(err);
    }
  };

  const handleEdit = () => {
    onClose();
    navigate(`/edit/${tx.id}`);
  };

  return {
    confirmDelete,
    setConfirmDelete,
    handleDelete,
    handleEdit,
  };
}
