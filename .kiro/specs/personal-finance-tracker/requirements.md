# Requirements Document

## Introduction

A client-side Personal Finance Tracker web app built with vanilla HTML, CSS, and JavaScript. Users can log transactions via a simple form, view a scrollable transaction list, see their total balance, and visualize spending by category in a pie chart. All data is persisted in the browser's localStorage. No backend, no build tools, no frameworks required.

## Glossary

- **App**: The Personal Finance Tracker single-page web application.
- **Transaction**: A record of money spent, consisting of a name, amount, and category.
- **Category**: A fixed label grouping related transactions. Valid values are: Food, Transport, Fun.
- **Storage**: The browser's localStorage API used to persist all data client-side.
- **Transaction_List**: The scrollable UI component displaying all recorded Transactions.
- **Balance**: The running total of all Transaction amounts, displayed at the top of the App.
- **Chart**: A pie chart visualizing the proportion of total spending per Category.

---

## Requirements

### Requirement 1: Add Transaction via Input Form

**User Story:** As a user, I want to fill out a form and add a transaction to my list, so that I can record my spending quickly.

#### Acceptance Criteria

1. THE App SHALL provide a form with three fields: Item Name (text), Amount (positive number), and Category (select: Food, Transport, Fun).
2. WHEN a user submits the form with all fields filled and a valid positive Amount, THE App SHALL add the Transaction to the Transaction_List and persist it to Storage.
3. IF a user submits the form with any field empty or Amount set to a non-positive number, THEN THE App SHALL display an inline validation error and SHALL NOT save the Transaction.
4. WHEN a Transaction is successfully added, THE App SHALL reset the form fields to their default empty state.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see all my transactions in a scrollable list, so that I can review what I have recorded.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all recorded Transactions, each showing the Item Name, Amount, and Category.
2. THE Transaction_List SHALL be scrollable when the number of Transactions exceeds the visible area.
3. WHEN a user clicks the delete control on a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from Storage.

---

### Requirement 3: Total Balance

**User Story:** As a user, I want to see my total balance at the top of the page, so that I always know my current spending total.

#### Acceptance Criteria

1. THE App SHALL display the Balance as the sum of all Transaction amounts at the top of the page.
2. WHEN a Transaction is added, THE App SHALL recalculate and update the Balance immediately without a page reload.
3. WHEN a Transaction is deleted, THE App SHALL recalculate and update the Balance immediately without a page reload.

---

### Requirement 4: Spending Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE App SHALL display a pie Chart showing the proportion of total spending for each Category that has at least one Transaction.
2. WHEN a Transaction is added or deleted, THE App SHALL re-render the Chart to reflect the updated spending distribution without a page reload.
3. IF there are no Transactions recorded, THEN THE App SHALL display an empty-state message in place of the Chart.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my data saved automatically, so that I do not lose my transactions when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Transaction is added or deleted, THE App SHALL immediately write the updated Transaction list to Storage.
2. WHEN the App loads, THE App SHALL read all Transactions from Storage and restore the Transaction_List, Balance, and Chart to the saved state.
3. IF Storage is unavailable or returns a parse error on load, THEN THE App SHALL initialize with empty state and display a non-blocking warning to the user.

---

### Requirement 6: Responsive UI

**User Story:** As a user, I want the app to work on different screen sizes, so that I can use it on desktop or mobile.

#### Acceptance Criteria

1. THE App SHALL render correctly on viewport widths from 320px to 1920px without horizontal scrolling.
2. THE App SHALL use semantic HTML elements and provide descriptive labels for all interactive controls.
3. WHEN a user interacts with any control (button, input, select), THE App SHALL respond within 100ms on a modern browser.
