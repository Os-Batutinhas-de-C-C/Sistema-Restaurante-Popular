# Design

## Context

See `proposal.md` for the motivation and `specs/geracao-semanal-cardapio/spec.md` for the behavior contract. The current generator selects one historical meal in the daily editor. The weekly screen lists five business days, and the existing API accepts all five meal slots in one create or update request.

## Goals / Non-Goals

**Goals:**

- Keep a generated week as client-side preview state until the Nutricionista confirms it.
- Define sameness by the eight menu item fields; caloric value and historical record ID do not make otherwise identical menus different.
- Preserve the same meal slots and dates when committing the preview as one weekly API operation.

**Non-Goals:**

- Require every individual dish or ingredient to be unique across the week.
- Create new menu combinations by mixing fields from separate historical meals.
- Change backend endpoints, permissions, or the existing manual daily editing workflow.

## Decisions

1. **Generate from complete historical meals.** Reuse the existing history query and map each complete historical meal as one candidate. This retains known combinations and their calorie values; synthesizing meals field-by-field would produce combinations without an established source or validation.

2. **Compare normalized menu composition, not database identity.** Build a uniqueness key from the eight dish fields after trimming surrounding whitespace and comparing without case sensitivity. Exclude calories and record IDs from the key so duplicate historical records or calorie edits cannot make the same menu appear unique. Repeated individual dishes remain allowed when the full combinations differ.

3. **Require five distinct candidates before showing a preview.** Select five unique candidates and assign them to Monday through Friday. If fewer than five are available, show an explanatory message and leave both the current week and any existing menus untouched; do not offer a partial preview. This avoids a week that only looks generated in part.

4. **Keep preview separate from persisted data.** Store the candidate week separately from the loaded week. The weekly screen displays a clear preview state with per-day summaries and explicit save and discard actions. Saving sends the complete five-slot week in one POST or PUT according to whether that week exists. Discarding or navigating away drops the preview without saving. Existing week contents remain visible as the saved state until confirmation.

5. **Place the action on the weekly list.** Add the generation and preview controls to the Nutricionista's Cardápios list for the selected week. Remove the daily form's generation control and retain its normal edit and save actions.

## Risks / Trade-offs

- [The history may contain fewer than five distinct complete combinations] → Explain the shortage and preserve the loaded week; do not silently repeat combinations or partially replace the preview.
- [Historical text may differ only in casing or surrounding spaces] → Normalize those differences when checking uniqueness.
- [The preview is not persisted while the user reviews it] → Clearly label preview state and discard it when changing the selected period or leaving the screen.
- [A weekly save request can fail] → Keep the preview available, show the API error, and allow retry without modifying the displayed saved week.

## Migration Plan

No data migration or API contract change is needed. Rollback removes the weekly generation UI and preview handling; already confirmed weeks remain ordinary saved cardápios and can be edited with the existing daily flow.
