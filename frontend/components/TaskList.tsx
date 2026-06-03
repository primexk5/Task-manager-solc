import React from 'react';
import { ethers } from 'ethers';
import { Task } from '../types';

interface TaskListProps {
  contract: ethers.Contract | null;
  tasks: Task[];
  loading: boolean;
  handleMarkCompleted: (id: number) => Promise<void>;
  handleUpdateTask: (id: number) => Promise<void>;
  handleDeleteTask: (id: number) => Promise<void>;
}

export function TaskList({ contract, tasks, loading, handleMarkCompleted, handleUpdateTask, handleDeleteTask }: TaskListProps) {
  return (
    <div className="md:col-span-2 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-800">Your Tasks</h2>
        {loading && <div className="text-xs text-teal-500 animate-pulse font-medium">Syncing with blockchain...</div>}
      </div>

      {!contract ? (
        <div className="p-10 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/50">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-1">Not Connected</h3>
          <p className="text-sm text-slate-500 max-w-sm">Connect your wallet to load tasks from the contract and start managing them.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/50">
          <h3 className="text-lg font-medium text-slate-700 mb-1">No tasks yet</h3>
          <p className="text-sm text-slate-500">Create your first task to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                task.completed 
                  ? "bg-slate-50/50 border-slate-200 opacity-80" 
                  : "bg-white border-slate-200 shadow-sm hover:border-teal-500/50 hover:shadow-teal-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => !task.completed && handleMarkCompleted(task.id)}
                    disabled={task.completed || loading}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed 
                        ? "bg-teal-500/10 border-teal-500/50 text-teal-500" 
                        : "border-slate-300 hover:border-teal-400"
                    }`}
                  >
                    {task.completed && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                  </button>
                  <div>
                    <p className={`font-medium text-lg transition-all ${task.completed ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800"}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {task.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!task.completed && (
                    <button
                      onClick={() => handleUpdateTask(task.id)}
                      disabled={loading}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-teal-500 transition-colors"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={loading}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
