import type { AccountControlHubPayload } from "../domain/types";

export type SettingsRepository = {
  getAccountControlHub(viewerId: string | null): AccountControlHubPayload;
  resetFullPersonalization(): void;
  resetRecommendationMemory(): void;
  resetAdaptiveLearningMemory(): void;
};
