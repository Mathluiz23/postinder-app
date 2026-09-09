import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { Post, PostStatus } from "../types";
import { PortalAdapter } from "../services/portalAdapters";

function isPending(post: Post) {
  return post.status === PostStatus.PENDING_APPROVAL;
}

function isConflict(err: unknown) {
  return (err as { response?: { status?: number } })?.response?.status === 409;
}

interface Options {
  pollIntervalMs?: number;
}

export function useApprovalQueue(adapter: PortalAdapter, options: Options = {}) {
  const [queue, setQueue] = useState<Post[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { posts } = await adapterRef.current.fetchPortal();
      setQueue(posts.filter(isPending));
      setIndex(0);
    } catch (err) {
      if (!silent) Alert.alert("Erro ao carregar a fila", "Tente novamente em instantes.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!options.pollIntervalMs) return;
    const id = setInterval(() => load(true), options.pollIntervalMs);
    return () => clearInterval(id);
  }, [load, options.pollIntervalMs]);

  const current = queue[index];

  function advance() {
    setIndex((i) => (i + 1 < queue.length ? i + 1 : queue.length));
    setQueue((prev) => (index + 1 < prev.length ? prev : []));
  }

  async function handleApprove(positiveReaction?: "loved") {
    if (!current) return;
    try {
      await adapterRef.current.approve(current, positiveReaction);
      advance();
    } catch (err) {
      if (isConflict(err)) {
        Alert.alert("Este post foi atualizado", "Vamos recarregar a fila com a versão mais recente.");
        load();
      } else {
        Alert.alert("Não foi possível registrar sua decisão");
      }
    }
  }

  async function handleReject(comment: string, tags?: string[]) {
    if (!current) return;
    try {
      await adapterRef.current.reject(current, comment, tags);
      setAdjustmentOpen(false);
      advance();
    } catch (err) {
      if (isConflict(err)) {
        setAdjustmentOpen(false);
        Alert.alert("Este post foi atualizado", "Vamos recarregar a fila com a versão mais recente.");
        load();
      } else {
        Alert.alert("Não foi possível enviar a solicitação");
      }
    }
  }

  return {
    loading,
    queue,
    index,
    current,
    adjustmentOpen,
    setAdjustmentOpen,
    handleApprove,
    handleReject,
    reload: load,
  };
}
