import React from 'react';
import { ethers } from 'ethers';

interface NewTaskFormProps {
  contract: ethers.Contract | null;
  loading: boolean;
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  handleCreateTask: (e: React.FormEvent) => Promise<void>;
}

export function NewTaskForm({ contract, loading, newTaskTitle, setNewTaskTitle, handleCreateTask }: NewTaskFormProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        New Task
      </h2>
      <form onSubmit={handleCreateTask} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Task Title</label>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            disabled={!contract || loading}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm transition-all disabled:opacity-50 text-slate-800"
          />
        </div>
        <button
          type="submit"
          disabled={!contract || !newTaskTitle || loading}
          className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded-xl transition-all shadow-md shadow-teal-500/20 active:scale-95 flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            "Add Task"
          )}
        </button>
      </form>
    </div>
  );
}
