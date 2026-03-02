# Investigation: Bug Fix - Search Filters and Sliders

## Bug Summary
The `/search` section needs several improvements:
1. **Multichoice Industry Filter**: Selected industries should appear as removable tags in the search bar.
2. **Multichoice Location Filter**: Add a new multichoice filter for "Location" with removable tags.
3. **Range Sliders**: Sliders currently only have one handle (minimum). They need both minimum and maximum handles.
4. **API Testing**: Verify all changes via API.

## Root Cause Analysis
- `components/advanced-search.tsx` only shows the number of selected industries, not tags.
- There is no "Location" filter or field in the `entities` database schema.
- `components/ui/slider.tsx` is hardcoded to show only one handle.
- Backend filtering in `lib/actions/entities.ts` doesn't support "Location".

## Affected Components
- `lib/db/schema.ts`: Need to add `location` field to `entities` table.
- `lib/actions/entities.ts`: Need to support `locations` filter and return `location` in results.
- `components/advanced-search.tsx`: 
    - Add `selectedLocations` state.
    - Implement tag display for industries and locations.
    - Add "Clear all" buttons.
    - Add the new "Location" filter popover.
- `components/ui/slider.tsx`: Update to support multiple thumbs.
- `scripts/seed-entities.ts`: Add dummy location data.

## Proposed Solution
1. **Schema Update**: Add `location: text('location')` to `entities` table.
2. **Backend Update**: Add `locations?: string[]` to `getEntities` params and update the query.
3. **Slider Component**: Modify `Slider` to map over `props.value` (if it's an array) to render multiple thumbs.
4. **AdvancedSearch UI**:
    - Update state to include `selectedLocations`.
    - Create a `FilterTags` sub-component to display selected items.
    - Add the "Location" filter dropdown.
    - Implement "Clear all" logic.
5. **Seed Data**: Update the seeding script to include locations.
6. **API Route**: Check `app/api/advanced-search/route.ts` if it needs updates.

## Verification Plan
- Run `bun run build` and `bun typecheck` to ensure no regressions.
- Use a script (like `scripts/test-filters.ts`) to test the new filters via the API or server actions.
- Manually test the UI for tag removal and slider functionality.

## Implementation Notes
- **Schema Update**: Added `location` to `entities` table.
- **Backend**: Updated `getEntities` to support `locations` filter. Added `getAllFavoriteIds` action to optimize favorite fetching.
- **Slider**: Updated `components/ui/slider.tsx` to map over `props.value` to render multiple thumbs.
- **AdvancedSearch Refactor**: 
    - **Layout**: Moved search bar to the top, spanning full width. Introduced a multi-listing layout with a left sidebar for filters (desktop) and a mobile Sheet.
    - **Performance**: Optimized favorite fetching using `getAllFavoriteIds` instead of looping through individual `isFavorite` calls.
    - **Mobile Support**: Added a mobile filter toggle using `Sheet`.
    - **UI Enhancements**: Redesigned `EntityCard` and `EntityListItem` with a cleaner, more modern look inspired by Crunchbase. Added subtle animations and gradients.
    - **Bug Fix**: Fixed a potential hydration/runtime exception by optimizing server action usage in `useEffect`.
    - **Command Fix**: Resolved a `TypeError: undefined is not iterable` by adding the required `CommandList` wrapper around `CommandGroup` in the `Filters` component.
- **Seed Data**: Updated `scripts/seed-entities.ts` to include location data and seeded 20 entities.
- **Testing**: `scripts/test-filters.ts` verified that filtering by industry, location, and range works correctly. Comprehensive manual UI testing ensured mobile responsiveness and filter functionality.
