import { PostStatus } from "../types";

export const STATUS_LABEL: Record<string, string> = {
  [PostStatus.DRAFT]: "Rascunho",
  [PostStatus.READY]: "Pronto",
  [PostStatus.SENT]: "Enviado",
  [PostStatus.PENDING_APPROVAL]: "Pendente",
  [PostStatus.APPROVED]: "Aprovado",
  [PostStatus.REJECTED]: "Ajuste solicitado",
  [PostStatus.EXECUTED]: "Executado",
  [PostStatus.SCHEDULED]: "Agendado",
  [PostStatus.PUBLISHED]: "Publicado",
};
