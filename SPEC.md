# Prompt Workbench - Specification

## Project Overview

**Name:** Prompt Workbench  
**Type:** Web Application (React + Vite)  
**Core Functionality:** A hands-on tool for experimenting with prompts, comparing LLM outputs, and iterating on prompt engineering — directly demonstrating the skills needed for the AI Applied Researcher role.  
**Target Users:** Prompt engineers, AI researchers, developers working with LLMs

---

## UI/UX Specification

### Layout Structure

**Page Sections:**
1. **Header** - App title + tagline
2. **Main Workspace** - Split into two columns:
   - Left: Prompt Editor (input)
   - Right: Output Viewer (response)
3. **Control Bar** - Model selector, temperature, run button
4. **History Panel** - Collapsible sidebar showing past runs

**Grid Layout:**
- Header: full width, 60px height
- Main: flex row, left panel 45%, right panel 55%
- Control bar: 50px height between header and main
- History: 280px width, right side, collapsible

**Responsive Breakpoints:**
- Desktop: > 1024px (full layout)
- Tablet: 768-1024px (stacked columns)
- Mobile: < 768px (single column, tabbed view)

### Visual Design

**Color Palette:**
- Background: `#0D1117` (deep dark)
- Surface: `#161B22` (card/panel bg)
- Border: `#30363D` (subtle borders)
- Primary: `#58A6FF` (blue accent)
- Secondary: `#8B949E` (muted text)
- Success: `#3FB950` (green for good outputs)
- Warning: `#D29922` (amber for issues)
- Error: `#F85149` (red for failures)
- Text Primary: `#F0F6FC`
- Text Secondary: `#8B949E`

**Typography:**
- Font Family: `"JetBrains Mono", "Fira Code", monospace` for code/prompts
- Headings: `"Space Grotesk", sans-serif` - 24px/20px/16px
- Body: `"IBM Plex Sans", sans-serif` - 14px
- Code: 13px monospace

**Spacing System:**
- Base unit: 8px
- Padding small: 8px
- Padding medium: 16px
- Padding large: 24px
- Gap: 12px
- Border radius: 8px

**Visual Effects:**
- Cards: subtle `box-shadow: 0 4px 12px rgba(0,0,0,0.4)`
- Buttons: hover scale 1.02, transition 150ms
- Panel borders: 1px solid #30363D
- Focus states: 2px ring #58A6FF

### Components

**1. Prompt Editor**
- Textarea with syntax highlighting hints
- Character count
- Variable placeholders highlight (e.g., {{variable}})
- Clear button

**2. Model Selector**
- Dropdown with available models
- Shows model name + brief description

**3. Parameter Controls**
- Temperature slider (0-2, step 0.1)
- Max tokens input
- Top-p slider

**4. Run Button**
- Primary action, loading state with spinner
- Keyboard shortcut hint (Cmd+Enter)

**5. Output Viewer**
- Rendered markdown output
- Copy button
- Token count
- Latency display

**6. History Panel**
- List of past runs with timestamp
- Click to restore prompt + output
- Delete individual entries
- Clear all button

---

## Functionality Specification

### Core Features

1. **Prompt Input & Editing**
   - Multi-line text area for prompt entry
   - Variable detection ({{var}}) with highlighting
   - Auto-save to localStorage

2. **Model Configuration**
   - Select from multiple LLM backends
   - Adjust temperature, max tokens, top-p

3. **Output Display**
   - Render markdown responses
   - Show token usage, latency
   - Copy to clipboard

4. **Experiment Tracking**
   - Save all runs to history
   - Compare previous outputs
   - Export prompts as JSON

5. **Keyboard Shortcuts**
   - Cmd/Ctrl + Enter: Run prompt
   - Cmd/Ctrl + S: Save to history
   - Cmd/Ctrl + L: Clear output

### User Interactions

- Type prompt → see character count update
- Adjust sliders → see values in real-time
- Click Run → loading state → display output
- Click history item → restore prompt + output
- Toggle history panel → slide animation

### Data Handling

- Store history in localStorage
- Limit history to 50 entries (FIFO)
- Auto-save current prompt

### Edge Cases

- Empty prompt: disable run button
- API error: show error message with retry
- Very long output: scrollable container
- Network timeout: 30s max, show timeout error

---

## Acceptance Criteria

1. ✅ App loads without errors
2. ✅ Can enter a prompt and run it against an LLM
3. ✅ Output displays with proper formatting
4. ✅ Model parameters can be adjusted
5. ✅ History saves and restores correctly
6. ✅ UI matches dark theme spec
7. ✅ Keyboard shortcuts work
8. ✅ Mobile responsive layout works