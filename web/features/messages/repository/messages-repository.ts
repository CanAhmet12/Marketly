import type { ComposerSuggestion, MessageCenterPayload } from "../domain/types";

export type MessagesRepository = {
  getMessageCenter(viewerId: string | null): MessageCenterPayload;
  getComposerSuggestions(viewerId: string | null, conversationId: string | null): ComposerSuggestion[];
};
