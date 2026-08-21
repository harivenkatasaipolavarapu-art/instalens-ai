# Project TODO

- [x] Create the polished landing page with Instagram profile URL input and clear analysis CTA
- [x] Define database schema for saved analyses and structured Business DNA reports
- [x] Implement public-profile input validation and permitted public-signal analysis flow
- [x] Integrate server-side LLM generation for structured Business DNA reports
- [x] Add exact score dimensions: Clarity, Trust, Consistency, Discoverability, and Conversion Readiness
- [x] Add explanations for every score dimension
- [x] Add content theme map with product showcase, testimonials, promotions, and related labels
- [x] Add customer persona generator with explicit AI inference labeling
- [x] Add prioritized action recommendations such as add pricing highlight and clearer CTA
- [x] Add authenticated analysis history page with revisit flow
- [x] Add report detail/dashboard experience
- [x] Add structured PDF export for Business DNA Reports
- [x] Add responsive and accessible empty, loading, and error states
- [x] Add Vitest coverage for validation, report generation shape, history access, and export behavior
- [x] Run typecheck, tests, and visual browser verification
- [x] Save final checkpoint after all completed items are marked [x]
- [x] Carry the lens/signals/decisions visual system into the unauthenticated history state and utility routes
- [x] Implement structured public-signal extraction for bio, contact info, captions, and hashtags, and store them explicitly in sourceSignals
- [x] Replace print-based export with a true PDF generation/download flow for Business DNA Reports
- [x] Add explicit loading and error states for selected history detail and history query failures
- [x] Add Vitest tests for Business DNA report schema/shape, protected history retrieval, and PDF export behavior

## Agency Extensions

- [x] Add comparison mode for 2–3 profiles using the same five Business DNA dimensions
- [x] Add score ranking and side-by-side comparison explanations
- [x] Add re-analysis over time with weekly/manual rerun and score delta tracking
- [x] Add track-changes view with historical snapshots and impact narrative
- [x] Add AI outreach message generator using persona and weak-dimension insights
- [x] Add white-label PDF export with agency logo and branding fields
- [x] Add batch mode for 5–10 URLs with ranked five-dimension score table
- [x] Add CRM-ready lead card copy/export
- [x] Add agency UX navigation, loading/error states, and responsive layouts
- [x] Add Vitest coverage for comparison, score deltas, outreach, batch ranking, and lead export
- [x] Save agency extension checkpoint after all items are complete

## Agency Quality Follow-ups

- [x] Add comparison insights explaining why profiles rank differently across each dimension
- [x] Add a dedicated rerun action for selected history profiles and document manual cadence support
- [x] Replace client template outreach with an LLM-backed outreach procedure
- [x] Add a real white-label logo upload/reference and broader branding fields to PDF export
- [x] Show all five dimension scores in the batch ranking table
- [x] Surface loading and error feedback for compare, batch, and agency history actions
- [x] Add Vitest tests for agency ranking, delta calculation, outreach procedure, batch shape, and lead-card copy
- [x] Save a new agency extension checkpoint after all follow-ups pass

## Final Agency Polish

- [x] Add explicit copy documenting manual weekly re-analysis cadence
- [x] Render an uploaded white-label logo image inside the exported PDF
- [x] Add explicit batch loading and history loading states
- [x] Add testable outreach prompt construction and batch output-shape coverage
- [x] Save a fresh checkpoint after final agency polish

## History Comparison and Scoring Fixes

- [x] Add multi-select comparison for two or more saved business accounts in History
- [x] Add a visual comparison graph for Clarity, Trust, Consistency, Discoverability, and Conversion Readiness
- [x] Add score explanations that distinguish evidence, inference, and missing signals
- [x] Replace random-looking score generation with deterministic evidence-based scoring
- [x] Add low-score guidance showing exactly what signals are missing or weak
- [x] Add Vitest coverage for multi-account comparison data and deterministic score calculations
- [x] Verify History graphs and score explanations responsively
- [x] Save a new checkpoint after the comparison and scoring fixes

## Final History Quality Checks

- [x] Explicitly label Evidence, AI inference, and Missing signals in score explanations
- [x] Add a shared comparison chart-data helper and test it for 2+ accounts and all five dimensions
- [x] Verify the updated History page at mobile width
- [x] Save a fresh checkpoint after the History/scoring fixes

## Agency Workspace Simplification

- [x] Remove the Batch triage + client-ready output section from Agency
- [x] Add a timeline graph showing score changes across saved re-analysis snapshots
- [x] Add Top 10 and Top 50 ranked views using saved analyses only, with clear scope labeling
- [x] Add tests for timeline data and ranked saved-profile lists
- [x] Verify Agency layout responsively and save a new checkpoint
- [x] Verify the simplified Agency page at mobile width
- [x] Save a fresh checkpoint after the Agency Workspace simplification is verified

## Top Profiles Discovery

- [x] Add category and location scope inputs for profile discovery
- [x] Add approved/supplied discovery dataset contract without fabricating global Instagram results
- [x] Rank discovered profiles by the five deterministic Business DNA dimensions
- [x] Add Top 10 and Top 50 discovery results with dataset-scope labeling
- [x] Add filters and score rationale for discovered profiles
- [x] Add tests for discovery ranking and scope handling
- [x] Verify responsive discovery UX and save a new checkpoint

## Discovery Quality Follow-ups

- [x] Add an explicit Top 10 / Top 50 selector for discovery results
- [x] Add expandable score rationale and evidence summary for discovered profiles
- [x] Add discovery-specific scope validation and ranking tests
- [x] Save a fresh checkpoint after discovery follow-ups are verified

## Discovery Enhancements

- [x] Add minimum Business DNA score filter
- [x] Add evidence-confidence filter and confidence labels
- [x] Add CSV export for scoped Top 10/Top 50 discovery results
- [x] Add provider-ready empty state explaining automatic discovery requires an approved data source
- [x] Add Vitest coverage for filters and CSV row formatting
- [x] Verify responsive UX and save a fresh checkpoint

## Final Discovery Enhancement Checks

- [x] Add a dedicated automatic-discovery provider empty state with clear next-step copy
- [x] Add tests for minimum score and evidence-confidence filtering behavior
- [x] Save a new checkpoint after the discovery enhancement changes
- [x] Add Vitest tests that verify minimum-score and High/Medium/Low confidence filtering
- [x] Run typecheck and tests after adding the filter tests
- [x] Save a fresh webdev checkpoint after the final discovery-enhancement changes
- [x] Add Medium and Low confidence filter assertions
- [x] Re-run typecheck and tests after expanding confidence coverage
- [x] Save the final discovery enhancement checkpoint

## Discovery UI Polish

- [x] Separate category/location scope inputs from optional approved URL dataset input
- [x] Fix discovery input presentation so values never appear in the wrong field
- [x] Replace oversized provider notice with a compact informational callout
- [x] Improve discovery CTA hierarchy, spacing, and results controls
- [x] Verify the discovery section at desktop and mobile widths
- [x] Save a new checkpoint after the UI polish
- [ ] Save a fresh checkpoint after the Discovery UI Polish changes
