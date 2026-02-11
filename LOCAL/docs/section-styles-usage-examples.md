# Section Styles Usage Examples

## Easy Implementation with Section Wrapper

Now you can add section styles to any section with just a few lines of code!

### Method 1: Using the Section Wrapper (Recommended)

Instead of manually adding all the logic, use the `section-wrapper` snippet:

```liquid
<!-- Before: Manual approach -->
{% liquid
  assign s = section.settings
  assign section_id = section.id
  assign section_class = 'my-section'
  
  # Add section styles classes
  assign section_class = section_class | append: ' section-' | append: section_id
  
  # Check for any section styling options
  assign has_section_styles = false
  if s.border_bottom or s.border_top or s.background_color != blank or s.spacing_top != blank or s.spacing_bottom != blank or s.custom_css != blank
    assign has_section_styles = true
  endif
%}

{% if has_section_styles %}
  {% render 'section-styles', section: section, prefix: 'section' %}
{% endif %}

<section class="{{ section_class }}">
  <!-- Your content -->
</section>

<!-- After: Using section wrapper -->
{% render 'section-wrapper', 
    section: section, 
    base_class: 'my-section',
    additional_classes: 'custom-class another-class',
    content: '<div>Your content here</div>'
%}
```

### Method 2: Using Capture for Complex Sections

For sections with complex structure (like featured-collection), use capture to wrap all content:

```liquid
<!-- Capture all section content first -->
{% capture section_content %}
<div class='color-{{ section.settings.color_scheme }} isolate gradient'>
  <div class='collection section-{{ section.id }}-padding'>
    <!-- All your existing section content here -->
    <h2>{{ section.settings.title }}</h2>
    <!-- ... rest of content ... -->
  </div>
</div>
{% endcapture %}

<!-- Then render with section wrapper -->
{% render 'section-wrapper', 
  section: section, 
  base_class: 'section',
  additional_classes: 'color-' | append: section.settings.color_scheme | append: ' isolate gradient',
  content: section_content
%}
```

### Method 3: For Existing Sections with Complex Structure

If your section already has a complex structure and you don't want to use capture, you can just add the CSS generation:

```liquid
<!-- Add this before your section wrapper -->
{% liquid
  assign s = section.settings
  assign has_section_styles = false
  if s.border_bottom or s.border_top or s.background_color != blank or s.spacing_top != blank or s.spacing_bottom != blank or s.custom_css != blank
    assign has_section_styles = true
  endif
%}

{% if has_section_styles %}
  {% render 'section-styles', section: section, prefix: 'section' %}
{% endif %}

<!-- Add section-{id} class to your existing section element -->
<section class="your-existing-classes section-{{ section.id }}">
  <!-- Your existing content -->
</section>
```

## Adding Settings to Any Section

### Copy the Settings Schema

1. Open `snippets/section-styles-schema.liquid`
2. Copy the JSON content (lines 7-49)
3. Paste it into your section's schema settings array

### Example: Adding to a Rich Text Section

```json
{
  "name": "Rich text",
  "settings": [
    {
      "type": "richtext",
      "id": "text",
      "label": "Text"
    },
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
    }
  ]
}
```

## Complete Examples

### Simple Section Example

```liquid
<!-- sections/simple-text.liquid -->
{% liquid
  assign text_content = section.settings.text
%}

{% render 'section-wrapper', 
    section: section, 
    base_class: 'simple-text-section',
    additional_classes: 'page-width',
    content: text_content
%}

{% schema %}
{
  "name": "Simple Text",
  "settings": [
    {
      "type": "richtext",
      "id": "text",
      "label": "Text content"
    },
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
      "label": "Background color override"
    },
    {
      "type": "text",
      "id": "spacing_top",
      "label": "Top spacing",
      "placeholder": "2rem"
    },
    {
      "type": "text", 
      "id": "spacing_bottom",
      "label": "Bottom spacing",
      "placeholder": "2rem"
    }
  ],
  "presets": [
    {
      "name": "Simple Text"
    }
  ]
}
{% endschema %}
```

### Complex Section Example (Featured Collection Style)

For sections with complex structure and existing styling:

```liquid
<!-- sections/complex-section.liquid -->
{%- liquid
  assign products_to_display = section.settings.collection.all_products_count
  assign show_mobile_slider = false
  assign show_desktop_slider = false
  # ... other complex logic ...
-%}

<!-- Capture all content first -->
{% capture section_content %}
<div class='color-{{ section.settings.color_scheme }} isolate gradient'>
  <div class='collection section-{{ section.id }}-padding{% if section.settings.full_width %} collection--full-width{% endif %}'>
    <div class='collection__title title-wrapper'>
      {%- if section.settings.title != blank -%}
        <h2 class='title {{ section.settings.heading_size }}'>{{ section.settings.title }}</h2>
      {%- endif -%}
    </div>
    
    <slider-component class='slider-mobile-gutter'>
      <ul class='grid product-grid'>
        {%- for product in section.settings.collection.products limit: section.settings.products_to_show -%}
          <li class='grid__item'>
            {% render 'card-product', card_product: product %}
          </li>
        {%- endfor -%}
      </ul>
    </slider-component>
    
    {%- if section.settings.show_view_all -%}
      <div class='collection__view-all'>
        <a href='{{ section.settings.collection.url }}' class='button'>
          View All Products
        </a>
      </div>
    {%- endif -%}
  </div>
</div>
{% endcapture %}

<!-- Render with section wrapper -->
{% render 'section-wrapper', 
  section: section, 
  base_class: 'section',
  additional_classes: 'color-' | append: section.settings.color_scheme | append: ' isolate gradient',
  content: section_content
%}

{% schema %}
{
  "name": "Complex Section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection"
    },
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
      "label": "Background color override"
    },
    {
      "type": "text",
      "id": "spacing_top",
      "label": "Top spacing",
      "placeholder": "2rem"
    },
    {
      "type": "text", 
      "id": "spacing_bottom",
      "label": "Bottom spacing",
      "placeholder": "2rem"
    }
  ]
}
{% endschema %}
```

## Benefits of This Approach

1. **Minimal Code**: Just one `{% render %}` tag for most cases
2. **Consistent**: All sections use the same styling system
3. **Reusable**: Settings schema can be copied to any section
4. **Flexible**: Can handle simple and complex section structures
5. **No Duplication**: CSS is generated efficiently per section

## Quick Checklist for Adding Section Styles

- [ ] Copy settings from `section-styles-schema.liquid` to your section's schema
- [ ] Add `{% render 'section-wrapper' %}` or the CSS generation logic
- [ ] Add `section-{{ section.id }}` class to your section element
- [ ] Test the styling options in the theme customizer

That's it! Your section now has reusable styling options.
