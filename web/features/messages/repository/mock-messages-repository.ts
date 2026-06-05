import { getSocialRepository } from "@/features/social/repository";

import type { ComposerSuggestion, MessageCenterPayload } from "../domain/types";
import type { MessagesRepository } from "./messages-repository";
import { assembleComposerSuggestions, assembleMessageCenter } from "./assemble-message-center";

export class MockMessagesRepository implements MessagesRepository {
  getMessageCenter(viewerId: string | null): MessageCenterPayload {
    const rows = viewerId ? getSocialRepository().getConversations(viewerId) : [];
    return assembleMessageCenter(viewerId, rows);
  }

  getComposerSuggestions(viewerId: string | null, conversationId: string | null): ComposerSuggestion[] {
    const rows = viewerId ? getSocialRepository().getConversations(viewerId) : [];
    return assembleComposerSuggestions(viewerId, conversationId, rows);
  }
}
