# Ahmad AI — Investor Presentation Diagram Guide

## Figma Layout Specification

This document provides precise instructions for creating a clean, investor-grade
system architecture diagram in Figma.

---

## 1. Canvas Setup

- **Frame**: 1920 × 1080 (16:9 presentation slide)
- **Background**: `#0F0F1A` (deep navy/black)
- **Grid**: 40px spacing, snap enabled
- **Font**: Inter (headings) + JetBrains Mono (technical labels)

---

## 2. Color System

| Layer                  | Fill Color   | Border Color | Opacity | Label Color |
|------------------------|-------------|-------------|---------|-------------|
| Presentation Layer     | `#A29BFE`   | `#6C5CE7`   | 100%    | `#FFFFFF`   |
| Agent Brain            | `#6C63FF`   | `#4A44B5`   | 100%    | `#FFFFFF`   |
| Multi-Agent System     | `#00B894`   | `#009874`   | 100%    | `#FFFFFF`   |
| Dual RAG               | `#FD79A8`   | `#E84393`   | 100%    | `#FFFFFF`   |
| Memory + Learning      | `#FDCB6E`   | `#E17055`   | 100%    | `#2D3436`   |
| External Integrations  | `#0984E3`   | `#0652DD`   | 100%    | `#FFFFFF`   |
| Infrastructure         | `#636E72`   | `#2D3436`   | 100%    | `#FFFFFF`   |
| Arrows/Connectors      | `#FFFFFF`   | —           | 40%     | —           |
| Section Labels         | —           | —           | —       | `#FFFFFF`   |

---

## 3. Hierarchy & Layout (Top to Bottom)

### Row 1: Presentation Layer (y: 60–140)
**Section label**: "PRESENTATION LAYER" — Inter Bold 11px, `#FFFFFF60`, letter-spacing 3px

| Component          | Width | Height | X Position | Notes                    |
|--------------------|-------|--------|------------|--------------------------|
| Dashboard UI       | 200   | 60     | 120        | "Next.js / React"        |
| Auth & Session     | 200   | 60     | 360        | "Supabase Auth"          |
| WebSocket          | 200   | 60     | 600        | "Real-time Updates"      |
| API Gateway        | 200   | 60     | 840        | "195 Routes"             |

- Corner radius: 12px
- Drop shadow: 0 4px 20px `#6C5CE740`

---

### Row 2: Agent Brain (y: 200–360)
**Section label**: "AGENT BRAIN" — Inter Bold 14px, `#6C63FF`

| Component          | Width | Height | X Position | Notes                    |
|--------------------|-------|--------|------------|--------------------------|
| Orchestrator       | 160   | 70     | 120        | "Intent Parser"          |
| Task Router        | 160   | 70     | 310        | "Priority Queue"         |
| Workflow Planner   | 160   | 70     | 500        | "DAG Builder"            |
| Decision Engine    | 160   | 70     | 690        | "Scoring + Selection"    |
| Wave Executor      | 160   | 70     | 880        | "Parallel Pipelines"     |

- **Arrows**: Horizontal connectors between each box, 2px stroke, `#6C63FF`
- **Feedback loop**: Curved dashed arrow from Wave Executor back to Orchestrator below the boxes
- Corner radius: 8px
- Drop shadow: 0 4px 24px `#6C63FF50`
- Inner glow effect on hover state (optional for interactive deck)

---

### Row 3: Multi-Agent System (y: 420–600)
**Section label**: "MULTI-AGENT SYSTEM — 8 Specialized Agents"

**Sub-groups** (use light background rectangles with 4px rounded corners):

| Sub-group         | Agents                        | X Range    | Background       |
|-------------------|-------------------------------|------------|------------------|
| Strategy Layer    | Strategist, Analytics         | 80–280     | `#00B89415`      |
| Content Layer     | Content, SEO                  | 320–520    | `#00B89415`      |
| Distribution      | Social, Email, Ads            | 560–820    | `#00B89415`      |
| Local             | Geo                           | 860–980    | `#00B89415`      |

Each agent box:
- Size: 150 × 50
- Corner radius: 8px
- Icon: Small emoji or custom icon left-aligned (optional)
- Font: Inter Medium 13px

---

### Row 4: Dual RAG + Memory (y: 660–840)
**Split into two halves:**

**Left half (x: 80–480): DUAL RAG SYSTEM**
- Two side-by-side cards:
  - "Internal Knowledge RAG" (200 × 140)
  - "Brand Knowledge RAG" (200 × 140)
- Each card shows pipeline: `Docs → Chunk → Embed → Store → Retrieve`
- Use small flow arrows inside each card
- Background: `#FD79A815`

**Right half (x: 520–980): AGENT MEMORY + LEARNING**
- Three boxes stacked:
  - "Short-Term Memory (Redis)" — `#FDCB6E`, 200 × 50
  - "Long-Term Memory (Supabase)" — `#FDCB6E`, 200 × 50
  - "Learning Loop" — `#FDCB6EAA`, 400 × 50, spans full width
- Circular arrow icon on Learning Loop box
- Background: `#FDCB6E15`

---

### Row 5: External Integrations (y: 900–1000)
**Section label**: "EXTERNAL INTEGRATIONS"

| Provider Group    | Items                              | Width | X Position |
|-------------------|------------------------------------|-------|------------|
| AI Providers      | OpenAI (GPT-4 + Embeddings)        | 140   | 80         |
| SEO Data          | DataForSEO, SerpAPI, Serper        | 180   | 240        |
| Google Suite      | Google Ads, GA4, GSC               | 180   | 440        |
| Social Platforms  | Meta, LinkedIn                     | 140   | 640        |
| Messaging         | WhatsApp Business                  | 120   | 800        |
| Email             | Brevo (Sendinblue)                 | 120   | 940        |

- Each box: 45px height, corner radius 6px
- Use provider logos (small, 20×20) if available
- Font: Inter Regular 11px

---

### Row 6: Infrastructure (y: 1040–1080)
**Section label**: "INFRASTRUCTURE"

Three equal-width boxes spanning full width:

| Component                          | Width | Notes                     |
|------------------------------------|-------|---------------------------|
| Supabase (PostgreSQL + pgvector)   | 300   | Database + Auth + Vectors |
| Redis                              | 300   | Cache + Queue + Session   |
| Cloudflare R2                      | 300   | Object Storage (assets)   |

- Color: `#636E72`, height 40px
- Subtle bottom border: 2px `#2D3436`

---

## 4. Connectors & Data Flow

### Primary Flow (vertical arrows, 2px, `#FFFFFF40`)
1. Presentation → Agent Brain (labeled "API calls")
2. Agent Brain → Multi-Agent System (labeled "dispatch tasks")
3. Multi-Agent System → Integrations (labeled "call providers")

### Secondary Flow (dashed, 1.5px)
4. Agents ↔ Dual RAG (bidirectional, `#FD79A880`, labeled "retrieve / inject context")
5. Agents ↔ Memory (bidirectional, `#FDCB6E80`, labeled "read / write state")
6. Memory → Brain (upward, `#FDCB6E60`, labeled "feedback loop")

### Infrastructure Flow (dotted, 1px, `#636E7260`)
7. RAG → Supabase (labeled "pgvector")
8. Memory → Redis + Supabase
9. Integrations → R2 (labeled "asset storage")

---

## 5. Typography Hierarchy

| Element               | Font           | Weight   | Size | Color      |
|-----------------------|----------------|----------|------|------------|
| Diagram Title         | Inter          | Bold     | 28px | `#FFFFFF`  |
| Subtitle              | Inter          | Regular  | 16px | `#FFFFFF80`|
| Section Label         | Inter          | Bold     | 11px | `#FFFFFF60`|
| Component Name        | Inter          | SemiBold | 14px | `#FFFFFF`  |
| Component Detail      | JetBrains Mono | Regular  | 11px | `#FFFFFFB0`|
| Arrow Label           | Inter          | Regular  | 10px | `#FFFFFF60`|
| Stat/Number           | Inter          | Bold     | 18px | Accent     |

---

## 6. Header Block

Position: Top-left corner (x: 80, y: 20)

```
Ahmad AI                          ← Inter Bold 28px, #FFFFFF
Agentic Marketing Operating System ← Inter Regular 16px, #FFFFFF80
```

**Key stats strip** (positioned top-right, y: 30):

| Stat              | Value | Color     |
|-------------------|-------|-----------|
| API Routes        | 195   | `#6C63FF` |
| Agents            | 8     | `#00B894` |
| Integrations      | 12    | `#0984E3` |
| Knowledge Stores  | 2     | `#FD79A8` |

Each stat: pill-shaped badge, 80 × 30, corner radius 15px

---

## 7. Optional Enhancements

1. **Glow effects**: Subtle outer glow on the Brain section (`#6C63FF`, blur 40px, opacity 20%)
2. **Gradient overlays**: Top-to-bottom gradient on the background (`#0F0F1A` → `#1A1A2E`)
3. **Animated version**: If using Figma prototyping, add sequential fade-in for each layer (200ms delay between rows)
4. **Dark glass effect**: For sub-group backgrounds, use `backdrop-filter: blur(10px)` equivalent with semi-transparent fills
5. **Connection dots**: Small 6px circles at arrow endpoints for cleaner visual connections

---

## 8. Export Settings

- **PNG**: 2x scale, include background
- **SVG**: For web embedding
- **PDF**: For print/investor deck inclusion
- **Figma link**: Share as view-only prototype for interactive presentation

---

## 9. Slide Variants

### Variant A: Full System (this document)
All 6 rows visible — the "hero" architecture slide.

### Variant B: Simplified (for 30-second pitch)
Show only: Presentation → Brain → Agents → Integrations
Collapse RAG + Memory into a single "Intelligence Layer" box.

### Variant C: Data Flow Focus
Same layout but highlight only the arrows/connectors.
Dim all boxes to 30% opacity, keep arrows at 100%.
Good for explaining "how data moves through the system."

### Variant D: Agent Detail
Zoom into the Multi-Agent System row.
Show each agent as a larger card with:
- Agent name
- Capabilities (3 bullet points)
- Connected providers
- Example output
