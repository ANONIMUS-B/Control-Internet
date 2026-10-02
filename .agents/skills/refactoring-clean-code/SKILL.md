---
name: refactoring-clean-code
description: Refactor legacy, bloated, or complex code into clean, modular, maintainable, and readable components without altering external behavior. Applies SOLID principles, design patterns, and code smell eradication. Trigger when cleaning up large files, splitting monolithic components, reducing cyclomatic complexity, or improving maintainability.
---

# Clean Code & Refactoring Guide

Safely transform complex, entangled, or bloated code into elegant, testable, and self-documenting modules while guaranteeing zero regression.

## The Cardinal Rule of Refactoring

```
Refactoring changes the INTERNAL structure of software without altering its EXTERNAL behavior.
```

If you change behavior, you are not refactoring; you are adding features or fixing bugs. Do them in separate steps.

---

## Common Code Smells & Cures

### 1. The God Class / Monolithic File
* **Symptom**: A single Controller, Service, or Component exceeds 400-500 lines, doing database queries, validation, emails, and rendering.
* **Cure**:
  * **Backend**: Extract into single-action classes (`Invokable Actions`), Form Requests, or Domain Services.
  * **Frontend**: Extract reusable presentational child components and custom hooks (`useMembershipPricing`).

### 2. Deep Nesting & Arrow Anti-pattern
* **Symptom**: Code shaped like a triangle with 4+ levels of nested `if/else`, loops, and closures.
* **Cure**: Use **Guard Clauses** and early returns:
  ```php
  // Before
  if ($user) {
      if ($user->isActive()) {
          if ($user->hasPaid()) {
              return $this->grantAccess();
          }
      }
  }

  // After
  if (! $user || ! $user->isActive() || ! $user->hasPaid()) {
      return $this->denyAccess();
  }
  return $this->grantAccess();
  ```

### 3. Primitive Obsession & Long Parameter Lists
* **Symptom**: Functions taking 6+ primitive arguments (`$name, $price, $duration, $status, $notes, $discount`).
* **Cure**: Introduce a **DTO (Data Transfer Object)** or value object class with typed properties.

### 4. Switch / If-Else Ladder Polymorphism
* **Symptom**: Repeated `switch ($membershipType)` or `if ($gateway === 'stripe')` scattered across multiple files.
* **Cure**: Apply the **Strategy Pattern** or polymorphically bound interfaces (`PaymentGatewayInterface`).

---

## Safe Refactoring Step-by-Step

1. **Verify Existing Tests**: Ensure unit or feature tests cover the area being refactored. If no tests exist, write a characterization test first.
2. **Make Small, Incremental Moves**: Refactor one function, one method, or one variable at a time.
3. **Run Tests After Each Move**: Ensure green test suite after every single transformation.
4. **Clean and Rename**: Rename variables to be intent-revealing (`$expiringSubscriptions` instead of `$data`).
5. **Commit Separately**: Commit pure refactoring changes separately from feature commits (`refactor: extract membership billing to dedicated action`).
