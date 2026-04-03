# Implementation Plan: Expense & Budget Visualizer

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure (`css/`, `js/`)
  - Create `index.html` with semantic structure and form elements
  - Include Chart.js via CDN
  - Add meta tags for responsive design
  - _Requirements: 1.1, 1.2, 4.1, 5.1, TC-1_

- [x] 2. Implement CSS styling
  - Create `css/styles.css` with reset and base styles
  - Style container layout and header with balance display
  - Style transaction form with inputs, select, and button
  - Style transaction list with delete buttons
  - Style chart section with canvas container
  - Add error message and empty state styling
  - Include responsive design for mobile devices
  - _Requirements: NFR-1, NFR-3, TC-1, TC-3_

- [x] 3. Implement Storage Module
  - [x] 3.1 Create StorageModule with load and save methods
    - Implement `isAvailable()` to check LocalStorage support
    - Implement `load()` to retrieve and parse transactions from LocalStorage
    - Implement `save()` to serialize and store transactions
    - Add try-catch error handling for all storage operations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, TC-2_

- [x] 4. Implement core transaction logic
  - [x] 4.1 Implement `validateForm(name, amount, category)`
    - Return error string for empty name
    - Return error string for non-positive or missing amount
    - Return error string for missing category
    - Return `null` when all fields are valid
    - _Requirements: 1.3_

  - [x] 4.2 Implement `addTransaction(name, amount, category)`
    - Create transaction object with unique id, name, amount, category
    - Push to transactions array
    - Save to LocalStorage
    - Trigger re-render
    - _Requirements: 1.2, 5.1_

  - [x] 4.3 Implement `deleteTransaction(id)`
    - Filter transactions array by id
    - Save updated array to LocalStorage
    - Trigger re-render
    - _Requirements: 2.3, 5.1_

- [x] 5. Implement rendering functions
  - [x] 5.1 Implement `renderBalance()`
    - Sum all transaction amounts
    - Format as currency
    - Update balance display element
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.2 Implement `renderList()`
    - Clear and rebuild transaction list from state
    - Each item shows name, amount, category, and delete button
    - Show empty state message when no transactions
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.3 Implement `renderChart()`
    - Compute per-category spending totals
    - Destroy and recreate Chart.js pie chart instance
    - Guard against Chart.js CDN failure
    - Show empty state when no transactions
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.4 Implement `render()`
    - Call `renderList()`, `renderBalance()`, `renderChart()` in sequence
    - _Requirements: 3.2, 4.2_

- [x] 6. Implement form interaction and UI helpers
  - [x] 6.1 Implement `showFormError(msg)` and `clearFormError()`
    - Show/hide inline validation error element
    - _Requirements: 1.3_

  - [x] 6.2 Implement `resetForm()`
    - Reset all form fields to default empty state after successful submit
    - _Requirements: 1.4_

  - [x] 6.3 Wire form `submit` event listener
    - Prevent default form submission
    - Read values from name, amount, category fields
    - Call `validateForm`; on error show inline message and return
    - On success clear error, add transaction, reset form
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 7. Wire page load and bootstrap
  - Call `loadFromStorage()` then `render()` on `DOMContentLoaded`
  - Show storage warning banner if LocalStorage is unavailable
  - _Requirements: 5.2, 5.3_
