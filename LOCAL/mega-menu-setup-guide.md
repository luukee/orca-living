# Enhanced Mega Menu Setup Guide (Metaobject Version)

This guide will help you set up the enhanced mega menu with rich content, images, and custom layouts using Shopify metaobjects to match your Figma design.

## What's Been Added

### 1. Enhanced CSS (`component-mega-menu-enhanced.css`)
- Rich content layout with 4-column grid
- Image support with responsive design
- Top navigation row for main categories
- Custom styling for categories, materials, and use cases
- Mobile-responsive design

### 2. Modified Header Template (`sections/header.liquid`)
- Smart detection of rich content vs basic menu
- Support for metaobject-based content
- Fallback to original mega menu for items without rich content
- Enhanced Liquid logic for dynamic content

### 3. Metaobject Configuration
- **Metaobject Definition**: `mega_menu_content` with 7 fields
- **Collection Metafield**: References the metaobject for mega menu content
- **Flexible Content Management**: Reusable content blocks

## Setup Steps

### Step 1: Create Metaobject Definition
1. Go to your Shopify admin
2. Navigate to **Settings** → **Custom data** → **Metafields and metaobjects**
3. In the **Metaobject definitions** section, click **Add definition**
4. Create a new metaobject with these settings:
   - **Definition name**: `Mega Menu Content`
   - **Type**: `mega_menu_content`
   - **Description**: `Rich content for mega menu display including images, categories, and call-to-action`

### Step 2: Add Fields to Metaobject
Add these 7 fields to your metaobject:

1. **Image Field**:
   - **Key**: `image`
   - **Name**: `Mega Menu Image`
   - **Type**: `File`
   - **File types**: `Images`

2. **Image Alt Text**:
   - **Key**: `image_alt`
   - **Name**: `Image Alt Text`
   - **Type**: `Single line text`

3. **Categories**:
   - **Key**: `categories`
   - **Name**: `Categories`
   - **Type**: `Single line text`

4. **Materials**:
   - **Key**: `materials`
   - **Name**: `Materials`
   - **Type**: `Single line text`

5. **Use Cases**:
   - **Key**: `use_cases`
   - **Name**: `Use Cases`
   - **Type**: `Single line text`

6. **CTA Text**:
   - **Key**: `cta_text`
   - **Name**: `Call-to-Action Text`
   - **Type**: `Single line text`

7. **CTA URL**:
   - **Key**: `cta_url`
   - **Name**: `Call-to-Action URL`
   - **Type**: `URL`

### Step 3: Create Collection Metafield
1. In the **Metafield definitions** section, click on **Collections**
2. Click **Add definition**
3. Create a metafield with these settings:
   - **Namespace**: `custom`
   - **Key**: `mega_menu_content`
   - **Name**: `Mega Menu Content`
   - **Type**: `Metaobject reference`
   - **Metaobject type**: `Mega Menu Content`
   - **Owner type**: `Collection`
   - **Access**: `Storefront`

### Step 4: Create Mega Menu Content Entries
1. Go to **Content** → **Metaobjects** in your Shopify admin
2. Click **Add entry** for "Mega Menu Content"
3. Create entries for each collection that needs rich mega menu content
4. Fill in the fields for each entry:
   - **Mega Menu Image**: Upload your product image
   - **Image Alt Text**: `Pavers product image` (or descriptive text)
   - **Categories**: `In Stock, Brick Clay, Worn Clay, Terrazzo Clay, Cobble, Recycled Block, Pressed Clay, Tile, Wood Paver, Firebrick, Flagstone, Samples`
   - **Materials**: `Clay, Recycled Block, Wood, Stone`
   - **Use Cases**: `Paving, Driveways, Pathways, Vertical cladding, Interiors`
   - **Call-to-Action Text**: `Shop all pavers >`
   - **Call-to-Action URL**: Link to your pavers collection

### Step 5: Link Collections to Mega Menu Content
1. Go to **Products** → **Collections**
2. Edit the collection that should have rich mega menu content (e.g., "Pavers")
3. Scroll down to find the **Mega Menu Content** metafield
4. Select the metaobject entry you created in Step 4
5. Save the collection

### Step 6: Enable Mega Menu
1. Go to **Online Store** → **Themes** → **Customize**
2. Click on **Header** section
3. Set **Desktop menu type** to **Mega menu**
4. Save your changes

## Content Structure Example

Based on your Figma design, here's how to structure your "Pavers" menu item:

### Top Navigation Row
- Shop All
- Pavers (active)
- Hardware
- Plumbing
- Lighting
- Rock
- Furnishings
- Fire
- Accessories

### Rich Content Columns
**Category Column:**
- In Stock
- Brick Clay
- Worn Clay
- Terrazzo Clay
- Cobble
- Recycled Block
- Pressed Clay
- Tile
- Wood Paver
- Firebrick
- Flagstone
- Samples

**Material Column:**
- Clay
- Recycled Block
- Wood
- Stone

**Use Case Column:**
- Paving
- Driveways
- Pathways
- Vertical cladding
- Interiors

**Image Column:**
- Product image of pavers
- CTA: "Shop all pavers >"

## Customization Options

### CSS Customization
You can customize the appearance by editing `component-mega-menu-enhanced.css`:

- **Colors**: Modify CSS custom properties
- **Spacing**: Adjust padding and margins
- **Typography**: Change font sizes and weights
- **Layout**: Modify grid columns and responsive breakpoints

### Content Customization
- **Column titles**: Change "Category", "Material", "Use Case" in the Liquid template
- **CTA text**: Customize the call-to-action text
- **Image sizing**: Adjust image dimensions in CSS

## Responsive Behavior

- **Desktop**: 4-column layout with image on the right
- **Tablet**: 3-column layout with image below
- **Mobile**: Single column layout with stacked content

## Troubleshooting

### Mega Menu Not Showing Rich Content
1. Check that metafields are properly configured
2. Verify menu item has the required metafields filled
3. Ensure mega menu is enabled in theme settings

### Styling Issues
1. Check that `component-mega-menu-enhanced.css` is loading
2. Verify CSS custom properties are defined
3. Check for CSS conflicts with other styles

### Images Not Displaying
1. Verify image metafield is set to "File" type
2. Check image file size and format
3. Ensure proper image URL generation in Liquid

## Next Steps

1. Test the mega menu on different devices
2. Add content to other menu items as needed
3. Customize styling to match your brand
4. Consider adding animations or hover effects

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all metafields are properly configured
3. Test with a simple menu item first
4. Check that all files are properly uploaded to your theme
