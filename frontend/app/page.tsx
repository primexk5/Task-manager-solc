"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import TaskManagerABI from "./abi.json";
import { Task } from "../types";
import { Header } from "../components/Header";
import { NewTaskForm } from "../components/NewTaskForm";
import { TaskList } from "../components/TaskList";
import { useEthersSigner } from "../lib/useEthersSigner";

// Public on-chain config, read from the frontend's .env.local at build time.
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

// Dedicated read-only RPC so reads never depend on the wallet's (possibly
// broken/404ing) network RPC. The wallet is used only to sign writes.
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11155111);
const readProvider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID, {
  staticNetwork: true,
});
const readContract = ethers.isAddress(CONTRACT_ADDRESS)
  ? new ethers.Contract(CONTRACT_ADDRESS, TaskManagerABI, readProvider)
  : null;

// Poll readProvider for a receipt rather than using waitForTransaction, which
// can hang forever if the provider stumbles on a poll — leaving loading=true.
async function waitForTx(hash: string): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const receipt = await readProvider.getTransactionReceipt(hash);
    if (receipt !== null) return;
    await new Promise<void>((r) => setTimeout(r, 2000));
  }
  throw new Error("Transaction not confirmed after 60 s.");
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return err || fallback;
  if (typeof err !== "object" || err === null) return fallback;
  const e = err as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const shortMessage = str(e.shortMessage);
  const message = str(e.message);
  const infoMessage = str((e.info as Record<string, unknown> | undefined)?.error);
  const raw = [shortMessage, message, infoMessage].filter(Boolean).join(" ").toLowerCase();

  if (e.code === 4001 || raw.includes("user rejected")) {
    return "Transaction rejected in your wallet.";
  }
  if (
    raw.includes("could not coalesce") ||
    raw.includes("404") ||
    raw.includes("failed to fetch") ||
    raw.includes("internal json-rpc")
  ) {
    return "Network error. Please check your wallet's RPC settings and try again.";
  }
  return shortMessage ?? message ?? fallback;
}

export default function Home() {
  // Wallet connection is handled by RainbowKit/wagmi; we adapt the connected
  // wallet into an ethers signer so the contract calls below stay unchanged.
  const signer = useEthersSigner();

  const contract = useMemo(() => {
    if (signer && ethers.isAddress(CONTRACT_ADDRESS)) {
      return new ethers.Contract(CONTRACT_ADDRESS, TaskManagerABI, signer);
    }
    return null;
  }, [signer]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch tasks through the dedicated read RPC (independent of the wallet).
  const fetchTasks = useCallback(async () => {
    if (!readContract) return;
    try {
      setLoading(true);
      const data = await readContract.getAllTasks();
      const formattedTasks = data.map((t: { id: bigint; title: string; completed: boolean }) => ({
        id: Number(t.id),
        title: t.title,
        completed: t.completed,
      }));
      setTasks(formattedTasks);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load tasks."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on mount via the read RPC (no wallet needed for reading). The
  // setTimeout defers the state update out of the effect body to satisfy the
  // React Compiler's "no synchronous setState in effect" rule.
  useEffect(() => {
    const timer = setTimeout(() => fetchTasks(), 0);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !newTaskTitle) return;
    try {
      setLoading(true);
      const tx = await contract.createTask(newTaskTitle);
      await waitForTx(tx.hash);
      setNewTaskTitle("");
      await fetchTasks();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create task."));
    } finally {
      setLoading(false);
    }
  };

  // Mark Completed
  const handleMarkCompleted = async (id: number) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.markCompleted(id);
      await waitForTx(tx.hash);
      await fetchTasks();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to mark task as completed."));
    } finally {
      setLoading(false);
    }
  };

  // Update Task
  const handleUpdateTask = async (id: number) => {
    if (!contract) return;
    const newTitle = prompt("Enter new title for the task:");
    if (!newTitle) return;
    try {
      setLoading(true);
      const tx = await contract.updateTask(id, newTitle);
      await waitForTx(tx.hash);
      await fetchTasks();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update task."));
    } finally {
      setLoading(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: number) => {
    if (!contract) return;
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      setLoading(true);
      const tx = await contract.deleteTask(id);
      await waitForTx(tx.hash);
      await fetchTasks();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete task."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <Header />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <NewTaskForm
              contract={contract}
              loading={loading}
              newTaskTitle={newTaskTitle}
              setNewTaskTitle={setNewTaskTitle}
              handleCreateTask={handleCreateTask}
            />
          </div>

          <TaskList
            contract={contract}
            tasks={tasks}
            loading={loading}
            handleMarkCompleted={handleMarkCompleted}
            handleUpdateTask={handleUpdateTask}
            handleDeleteTask={handleDeleteTask}
          />
        </div>
      </div>
    </div>
  );
}
