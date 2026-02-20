# Filters – finishing touches

- [ ] **Use `format-tag-label` in facets**  
  In `snippets/facets.liquid`, replace inline value-label formatting with the snippet everywhere a filter value is shown (e.g. `{% capture formatted_label %}{% render 'format-tag-label', input: value.label %}{% endcapture %}` then `{{ formatted_label | strip | escape }}`). Covers: vertical active pills (≈105), desktop filter list (≈289, 291, 367, 369), horizontal active pills (≈516), mobile filter list (≈867, 869), mobile active pills (≈1091), drawer pills (≈1218).

- [ ] **Use `format-tag-label` in navigation**  
  In `snippets/navigation-secondary.liquid`, replace the Category `display_text` assign (≈373) with a capture that renders `format-tag-label` with `input: tag`, then use that variable in the Category link (≈381).

- [ ] **Confirm all six facets loops use the allow-list**  
  In `snippets/facets.liquid`, ensure every `for filter in results.filters` loop gates output with `show_this_filter` (Loop 1: vertical pills; Loop 2: main filter list; Loop 3: horizontal pills; Loop 4: mobile filter list; Loop 5: mobile active pills; Loop 6: drawer pills). Check that Loop 1’s price_range block is inside `if show_this_filter`.

- [ ] **Test Pavers collection**  
  On Shop all Pavers, confirm only **Category**, **Material**, and **Use case** appear in the filter sidebar (no Color, Size, or Product type unless intended).

- [ ] **Test Hardware collection**  
  On Shop all Hardware, confirm only **Category** and **Material** appear (no Use case).

- [ ] **Test Color filter**  
  On a collection with Color filter, choose e.g. Calcite and confirm only Calcite variants are shown (no Ash, Adobe, Char, etc.).

- [ ] **Test filter counts**  
  With a filter applied, confirm the selected filter label shows the **variant** count (e.g. “Calcite (3)”) and the top count uses “variants” not “products”. Unfiltered, confirm counts match what’s on the current page where possible.

- [ ] **Fix loading-spinner reference (optional)**  
  If theme check still reports a missing `snippets/loading-spinner.liquid`, add the snippet or point `main-collection-product-grid.liquid` (≈253) at the correct spinner asset/snippet.
