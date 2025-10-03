# Orca Living Theme

## CLI Commands

[Shopify CLI Command Docs](https://shopify.dev/docs/api/shopify-cli/theme)

To check which store you're using, run:

```
shopify theme info
```


To login to the store via command line. First logout in case you are logged into another store:

```
shopify auth logout 
```

Login:

```
shopify theme dev --store orcaliving.myshopify.com --theme-editor-sync
```

## Accordion Page Requirements

When creating or editing accordion pages (like FAQ or About pages), follow these HTML structure requirements:

### Required HTML Structure
- Use `nine15--accordion-page` section template
- Content must be structured as raw HTML in the page editor

### Shopify Page Template Setup
1. **Template Selection**: In the Shopify admin, set the page template to `faq`
2. **Template File**: The `page.faq.json` template automatically includes the `nine15--accordion-page` section
3. **Section Configuration**: The accordion section uses the `master--accordion-splitter` snippet to parse the content

### HTML Format Rules
1. **Main Sections**: Use `<h5>` tags for main section headers
2. **Accordion Items**: Use `<h6>` tags for individual accordion items (questions/topics)
3. **Content**: Place content immediately after each `<h6>` tag, wrapped in `<div>` tags
4. **Lists**: Use `<ul>` and `<li>` tags inside `<div>` wrappers (not inside `<p>` tags)

### Example Structure
```html
<h5>Main Section Title</h5>
<h6>First Question/Topic</h6>
<div>
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
  </ul>
</div>
<h6>Second Question/Topic</h6>
<div>
  <p>Content goes here...</p>
</div>
```

### Common Issues to Avoid
- ❌ Don't put `<ul>` inside `<p>` tags (invalid HTML)
- ❌ Don't use `<meta charset="utf-8" />` tags in content
- ❌ Don't leave content outside of `<div>` wrappers after `<h6>` tags
- ❌ Don't use empty `<div>`, `<span>`, or `<b>` tags
- ❌ Don't use `dir="ltr"` or other unnecessary attributes

### How It Works
The `master--accordion-splitter` snippet automatically:
1. Parses `<h5>` tags → Creates main sections with sidebar navigation
2. Parses `<h6>` tags → Creates individual accordion buttons
3. Parses content after `<h6>` → Becomes collapsible accordion content
4. Automatically adds accordion classes (`.acc-container`, `.acc-item`, `.acc-btn`, `.acc-content`)