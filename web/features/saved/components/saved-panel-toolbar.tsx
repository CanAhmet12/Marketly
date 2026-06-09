import { SavedDataBadge } from "@/features/saved/components/saved-data-badge";
import { SAVED_SECTION_LABELS } from "@/features/saved/saved-section-params";
import type { SavedSectionId } from "@/features/saved/saved-section-params";

type Props = {
  section: SavedSectionId;
  visibleCount: number;
  mockOn: boolean;
};

export function SavedPanelToolbar({ section, visibleCount, mockOn }: Props) {
  return (
    <div className="sv-panel-toolbar">
      <div className="sv-panel-toolbar-left">
        <SavedDataBadge mockOn={mockOn} />
        <span className="sv-panel-stream">
          {SAVED_SECTION_LABELS[section]} · {visibleCount} kayıt
        </span>
      </div>
    </div>
  );
}
