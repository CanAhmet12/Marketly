import type { MessageInboxStreamId } from "@/features/messages/domain/types";

export {
  messageStreamToParam,
  resolveMessageStream,
} from "@/features/social/lib/inbox-stream-params";

export const MESSAGE_STREAM_ORDER: MessageInboxStreamId[] = [
  "important",
  "creators",
  "premium",
  "rooms",
  "markets",
  "discussions",
  "close",
  "all",
];

export const MESSAGE_STREAM_LABELS: Record<MessageInboxStreamId, string> = {
  important: "Önemli",
  creators: "Creator'lar",
  premium: "Premium",
  rooms: "Odalar",
  markets: "Piyasalar",
  discussions: "Tartışmalar",
  close: "Yakın çevre",
  all: "Tümü",
};
