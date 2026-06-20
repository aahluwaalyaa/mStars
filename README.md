# mStars ⭐

A lightweight, zero-dependency star rating widget for Blogger and static sites, backed by **Firebase Realtime Database** via the REST API.

- **Demo:** https://mBlocksForBloggers.blogspot.com/
- **Agency:** https://CIA.RealHappinessCenter.com
- **Author:** [Aahluwaalyaa](https://msa.RealHappinessCenter.com/)
- **License:** MIT

---

## Features

- ⭐ Configurable 1–N star ratings
- 📦 Zero JS dependencies — uses native `fetch()` for Firebase
- 🚀 Lazy-loaded via `IntersectionObserver` (no impact on initial page load)
- ♿ Fully accessible — ARIA roles, labels, keyboard navigation (Enter/Space)
- 🎨 Customisable text, size, colour, and alignment
- 📊 Google Rich Results / Schema.org `AggregateRating` injection
- 🌐 Works with multiple widgets on the same page

---

## Installation

### 1. Add the script tag

Place this **once** anywhere on your page (typically in your theme's HTML, before `</body>`):

```html
<mstars data-db="https://YOUR-PROJECT-default-rtdb.firebaseio.com/"></mstars>
<script type="module" src="mStarsL.js"></script>
```

Or using a plain `<div>` (recommended for **Blogger** — safer for its XML template parser):

```html
<div id="mStars" data-db="https://YOUR-PROJECT-default-rtdb.firebaseio.com/"></div>
<script type="module" src="mStarsL.js"></script>
```

The script checks for `<mstars>` first and falls back to `#mStars` automatically — both are supported simultaneously. The `<mstars>` custom tag is self-documenting and avoids ID conflicts, but Blogger's XML template engine can be strict about unknown element names, making the `<div>` the safer default there.

### 2. Place widget elements

Add one or more `.mStars` elements wherever you want a rating widget to appear:

```html
<div class="mStars"
     data-pagetype="item"
     data-url="https://your-site.com/your-post-url">
</div>
```

---

## Configuration

mStars has **three layers of configuration**, applied in this order (later layers win):

```
hardcoded defaults  →  window.mStarsConfig  →  mSettings[pageType]  →  data-* attributes
```

---

### Layer 1 — Hardcoded defaults

These values apply if nothing else overrides them:

| Key | Default | Description |
|---|---|---|
| `sNo` | `5` | Number of stars |
| `sSize` | `2.5` | Star size in `rem` |
| `tSize` | `1` | Label font size in `rem` |
| `tColor` | `''` | Label text colour (inherits from page if empty) |
| `sAlign` | `"center"` | Star alignment — `"left"`, `"center"`, or `"right"` |
| `sColorFill` | `"gold"` | Colour of filled/hovered stars |
| `sColorEmpty` | `"silver"` | Colour of empty stars |
| `sOpacityEmpty` | `0.1` | Opacity of empty (unrated) stars |
| `sOpacityHover` | `0.25` | Opacity of stars beyond the hovered star |
| `sTooltipBg` | `"rgba(255, 215, 0, 100%)"` | Tooltip background colour |
| `tTop` | `"Liked it? Rate it:"` | Label shown above stars before rating |
| `tBottom-lg` | `"$average$ average • $votes$ ratings"` | Bottom label at large size |
| `tBottom-md` | `"$average$ • $votes$ ratings"` | Bottom label at medium size |
| `tBottom-sm` | `"$average$ • $votes$ ratings"` | Bottom label at small size |
| `tThanks` | `"Thanks for rating!"` | Tooltip shown after a 4–5 star rating |
| `tDone` | `"You rated this $userRating$ star!"` | Tooltip shown when re-clicking a rated widget |

---

### Layer 2 — `window.mStarsConfig` (site-wide overrides)

Declare this **before** the `<script type="module">` tag to override defaults for every widget on the site:

```html
<script>
  window.mStarsConfig = {
    sNo: 5,
    sSize: 2,
    tColor: "#444",
    sAlign: "left",
    tTop: "Was this helpful?",
    tThanks: "Thank you so much!",
    tDone: "You gave $userRating$ stars."
  };
</script>
<script type="module" src="mStarsL.js"></script>
```

Any key you omit falls back to the hardcoded default. All keys from the defaults table above are valid here.

#### Template variables

The following placeholders are replaced at runtime in the relevant strings:

| Placeholder | Available in | Replaced with |
|---|---|---|
| `$average$` | `tBottom-lg/md/sm` | Current average rating (e.g. `4.25`) |
| `$votes$` | `tBottom-lg/md/sm` | Total number of votes |
| `$max$` | `tBottom-lg/md/sm` | Maximum stars (value of `sNo`) |
| `$userRating$` | `tDone` | The star number the user clicked |

---

### Layer 3 — `data-*` attributes on each `.mStars` element

These control per-widget layout and mode:

| Attribute | Values | Description |
|---|---|---|
| `data-pagetype` | `"default"`, `"item"`, `"archive"`, `"index"`, `"error_page"`, `"static_page"` | Selects the page-type settings bucket. Typically `"item"` for posts. |
| `data-url` | Full URL string | The canonical URL used as the unique Firebase key for this widget's ratings. **Required.** |
| `data-size` | `"lg"` (default), `"md"`, `"sm"` | Scales the widget. `sm` = 40% size, `md` = 60%, `lg` = 100%. |
| `data-display` | `"true"` | Render stars as **display-only** (no interaction, no top label). |
| `data-votes` | `"true"` | Show the bottom votes/average label even in display-only mode. |
| `data-schema` | Schema.org type e.g. `"BlogPosting"`, `"Article"` | Enables Google Rich Results JSON-LD injection for this widget. |
| `data-title` | String | Post title used in the Schema.org JSON-LD. Falls back to `document.title` if empty. |

---

## Usage Examples

### Standard interactive widget (post page)

```html
<div class="mStars"
     data-pagetype="item"
     data-url="https://your-site.com/2024/01/my-post.html">
</div>
```

### Small display-only widget with vote count (list/archive page)

```html
<div class="mStars"
     data-pagetype="archive"
     data-url="https://your-site.com/2024/01/my-post.html"
     data-size="sm"
     data-display="true"
     data-votes="true">
</div>
```

### Widget with Google Rich Results schema injection

```html
<div class="mStars"
     data-pagetype="item"
     data-url="https://your-site.com/2024/01/my-post.html"
     data-schema="BlogPosting"
     data-title="My Post Title">
</div>
```

### Multiple widgets on one page

Each `.mStars` element is independent. They are lazy-loaded as they scroll into view (500px pre-fetch margin).

```html
<!-- Post 1 -->
<div class="mStars" data-pagetype="item" data-url="https://your-site.com/post-1.html"></div>

<!-- Post 2 — smaller -->
<div class="mStars" data-pagetype="item" data-url="https://your-site.com/post-2.html" data-size="sm"></div>
```

---

## Advanced: Per Page-Type Overrides

Inside `mStarsL.js`, the `mSettings` object has empty buckets for each Blogger page type. You can populate them in the source to apply different defaults per context:

```js
// Inside mStarsL.js → mSettings
"archive": {
    "tTop": "",          // hide top label on archive pages
    "sAlign": "left"
},
"item": {
    "tTop": "Rate this post:"
}
```

These override `window.mStarsConfig` and the hardcoded defaults, but are only changeable in the source file itself.

---

## CSS Customisation

All widget elements have stable BEM class names you can override in your own stylesheet:

| Class | Element |
|---|---|
| `.mStars` | The root container element |
| `.mStars-wrapper` | The SVG stars row |
| `.mStars-wrapper--interactive` | Added when widget is interactive (not display-only) |
| `.mStars-wrapper--votes` | Added when `data-votes="true"` |
| `.mStars-star` | Each individual star SVG |
| `.mStars-star--clickable` | Star that can be clicked (not yet rated) |
| `.mStars-star--readonly` | Star that cannot be clicked |
| `.mStars-tooltip` | The thank-you / re-rate tooltip |
| `.mStars-average` | `<span>` containing the average rating number |
| `.mStars-votes` | `<span>` containing the vote count |

Example:

```css
.mStars-tooltip {
    background: #222;
    color: #fff;
    border-radius: 4px;
}

.mStars-star--clickable:hover {
    transform: scale(1.1);
}
```

---

## Firebase Setup

1. Create a [Firebase project](https://console.firebase.google.com/) and enable **Realtime Database**
2. Set your database rules to allow public read/write (for an unauthenticated blog widget):

```json
{
  "rules": {
    "mStars": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Copy your database URL (e.g. `https://your-project-default-rtdb.firebaseio.com/`) into `data-db` on the `#mStars` element.

---

## Data Structure

Ratings are stored in Firebase at:

```
mStars/
  {host}/
    {page-key}/
      r: 0.85      ← normalised rating (0–1), where 1 = full marks
      c: 42        ← vote count
```

The displayed average = `r × sNo` (e.g. `0.85 × 5 = 4.25 stars`).

---

## Browser Support

Requires browsers supporting ES Modules, `IntersectionObserver`, `fetch`, `async/await`, and `localStorage` — all modern browsers (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+).
