# Project Update: Server-Side Pagination

## The Problem
The `/sites` page was previously fetching **all 6,000+ sites** every time a user visited the page.
- **Payload Size**: ~3.3MB (Huge)
- **Performance**: Slow load times, browser hanging, high bandwidth usage.
- **Reliability**: Often failed to load on slower connections or local development ("stuck causing localhost hang").

## The Solution
We implemented **Server-Side Pagination**. Instead of sending everything at once, we now send data in small "pages".

### How it Works Now
1. **Database Level**: The database only returns 24 sites at a time (e.g., sites 1-24).
2. **On Demand**: When a user clicks "Next" (or Page 2), the server fetches sites 25-48.
3. **Smart Filtering**: When filtering (e.g., by "China"), the database does the work and only sends back the matching 157 sites (in pages of 24), rather than sending 6,000 sites and hiding the rest in the browser.

## The Results
- **Speed**: Page loads instantly (< 1 second).
- **Efficiency**: Data transfer reduced by **~99%** (from 3.3MB down to ~20KB per request).
- **Stability**: Fixed the "localhost stuck loading" issue.
