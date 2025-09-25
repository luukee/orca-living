# Section Styles Implementation Guide

## Overview
The new section styles system provides a reusable way to add consistent styling options to any section without CSS duplication.

## Files Created
- `snippets/section-styles.liquid` - Main snippet that generates CSS custom properties
- `snippets/section-styles-schema.liquid` - Reusable settings schema
- `assets/section-styles.css` - CSS foundation for the styling system

## How to Use in Any Section

### Step 1: Include the CSS Foundation
Add this to your theme's main CSS file or layout:
```liquid
{{ 'section-styles.css' | asset_url | stylesheet_tag }}
```

### Step 2: Add Settings to Section Schema
Include the settings from `section-styles-schema.liquid` in your section's schema:

```json
{
  "name": "Your Section",
  "settings": [
    // ... your existing settings ...
    {
      "type": "header",
      "content": "Section Styling"
    },
    {
      "type": "checkbox",
      "id": "border_top",
      "label": "Add top border",
      "default": false
    },
    {
      "type": "checkbox", 
      "id": "border_bottom",
      "label": "Add bottom border",
      "default": false
    },
    {
      "type": "color",
      "id": "background_color",
      "label": "Background color override",
      "info": "Override the section's background color"
    },
    {
      "type": "text",
      "id": "spacing_top",
      "label": "Top spacing",
      "info": "CSS value (e.g., '2rem', '40px')",
      "placeholder": "2rem"
    },
    {
      "type": "text", 
      "id": "spacing_bottom",
      "label": "Bottom spacing",
      "info": "CSS value (e.g., '2rem', '40px')",
      "placeholder": "2rem"
    },
    {
      "type": "textarea",
      "id": "custom_css",
      "label": "Custom CSS",
      "info": "Additional CSS custom properties (e.g., '--custom-property: value;')",
      "placeholder": "--custom-property: value;"
    }
  ]
}
```

### Step 3: Update Section Template

#### Option A: Simple Sections (Recommended)
Use the section wrapper for clean, simple implementation:

```liquid
{% render 'section-wrapper', 
    section: section, 
    base_class: 'your-section-class',
    additional_classes: 'any-additional-classes',
    content: '<div>Your content here</div>'
%}
```

#### Option B: Complex Sections (Capture Method)
For sections with complex structure, capture all content first:

```liquid
<!-- Capture all section content -->
{% capture section_content %}
<div class='your-existing-wrapper'>
  <!-- All your existing section content here -->
  <h2>{{ section.settings.title }}</h2>
  <!-- ... rest of content ... -->
</div>
{% endcapture %}

<!-- Then render with section wrapper -->
{% render 'section-wrapper', 
  section: section, 
  base_class: 'section',
  additional_classes: 'your-existing-classes',
  content: section_content
%}
```

#### Option C: Manual Implementation
For existing sections where you want minimal changes:

```liquid
{% liquid
  assign s = section.settings
  assign section_id = section.id
  assign section_class = 'your-section-class'
  
  comment 'Add section styles classes'
  assign section_class = section_class | append: ' section-' | append: section_id
  
  comment 'Check for any section styling options'
  assign has_section_styles = false
  if s.border_bottom or s.border_top or s.background_color != blank or s.spacing_top != blank or s.spacing_bottom != blank or s.custom_css != blank
    assign has_section_styles = true
  endif
%}

{% comment 'Render section styles CSS' %}
{% if has_section_styles %}
  {% render 'section-styles', section: section, prefix: 'section' %}
{% endif %}

<div class="{{ section_class }}">
  <!-- Your section content -->
</div>
```

## Available Styling Options

### Border Options
- `border_top` - Adds a top border with padding and margin
- `border_bottom` - Adds a bottom border with padding and margin

### Spacing Options
- `spacing_top` - Custom top spacing (CSS value like '2rem', '40px')
- `spacing_bottom` - Custom bottom spacing (CSS value like '2rem', '40px')

### Color Options
- `background_color` - Override background color

### Custom CSS
- `custom_css` - Add any CSS custom properties

## CSS Custom Properties Generated

The system generates CSS custom properties that are applied to your section:

```css
.section-{section-id} {
  --border-top: 1px solid #000;
  --border-padding-top: 4rem;
  --border-margin-top: 4rem;
  --border-bottom: 1px solid #000;
  --border-padding-bottom: 4rem;
  --border-margin-bottom: 4rem;
  --background-color: #ffffff;
  --spacing-top: 2rem;
  --spacing-bottom: 2rem;
  /* Any custom CSS you added */
}
```

## Benefits

1. **No CSS Duplication** - Each section generates its own CSS custom properties
2. **Reusable** - Same settings schema works across all sections
3. **Consistent** - Follows theme patterns and naming conventions
4. **Scalable** - Easy to add new styling options
5. **Performance** - Minimal CSS output, leverages CSS custom properties

## Example Usage

```liquid
<!-- In your section template -->
{% liquid
  assign section_class = 'hero-section section-' | append: section.id
%}

{% render 'section-styles', section: section %}

<section class="{{ section_class }}">
  <h1>{{ section.settings.title }}</h1>
  <p>{{ section.settings.description }}</p>
</section>
```

This will automatically apply any border, spacing, background, or custom CSS settings configured in the section settings.
