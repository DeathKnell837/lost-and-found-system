# Use Case Diagram Generation Prompt

Generate a **UML Use Case Diagram** for the following **Campus Lost & Found Management System**. Use proper UML notation with actors on the outside, use cases as ovals inside the system boundary, and relationships (association, include, extend) drawn correctly.

---

## System Name
**Campus Lost & Found Management System**

---

## Actors (3 actors only)

### 1. Student (left side, top)
- A campus student who can register, log in, report lost/found items, browse items, claim items, and manage their account.

### 2. Faculty/Staff (left side, bottom)
- A campus faculty member or staff who has the same capabilities as Student. Both actors share the same use cases on the left side (draw association lines from both actors to the same use cases).

### 3. Admin (right side)
- A system administrator who logs in through a dedicated admin panel, verifies reports, manages claims, manages system data, and generates reports.

---

## Use Cases

### Student & Faculty/Staff Use Cases (LEFT side — both actors connect to these)

1. **Register Account** — Create a new account with username, email, and password
2. **Login** — Authenticate with username/email and password
3. **Report Lost Item** — Submit a lost item report with details, location, contact info, and image upload
    - **<<include>>** Email Notification (confirmation email sent)
4. **Report Found Item** — Submit a found item report with details, location, contact info, and image upload
    - **<<include>>** Email Notification (confirmation email sent)
5. **View Lost Items** — Browse paginated list of approved lost items with search and filters
    - **<<include>>** Search Items
6. **View Found Items** — Browse paginated list of approved found items with search and filters
    - **<<include>>** Search Items
7. **Claim Item** — Submit a claim request for an item with proof of ownership and supporting images
8. **Track Claim Status** — View all personal claims and their current status (pending, under review, approved, rejected, withdrawn)
9. **View Dashboard** — See personal statistics and recent reported items
10. **Update Profile** — Change username, email, phone number, and password
11. **Withdraw Claim** — Cancel a pending or under-review claim request

### Admin Use Cases (RIGHT side)

12. **Login** — Authenticate through the dedicated admin login page
13. **View All Reports** — View all submitted item reports with filters by status, type, category, and search
14. **Verify Lost Item Report** — Review a pending lost item report and approve or reject it
    - **<<include>>** Email Notification (notify reporter of decision)
15. **Verify Found Item Report** — Review a pending found item report and approve or reject it
    - **<<include>>** Email Notification (notify reporter of decision)
16. **Approve Claim Request** — Approve a valid claim, marking item as claimed and rejecting other pending claims
    - **<<include>>** Email Notification (notify claimant and reporter)
    - **<<extend>>** Reject Other Pending Claims (automatically rejects remaining claims for the same item)
17. **Reject Claim Request** — Deny an invalid claim with a rejection reason
    - **<<include>>** Email Notification (notify claimant)
18. **Update Item Status** — Edit item details, change status, replace images, or delete items
19. **Generate Reports** — View statistics (items by category, monthly trends, success rate, top locations) and export data as CSV
20. **Manage Categories** — Create, update, and delete item categories
21. **Manage Locations** — Create, update, delete campus locations; approve or reject user-suggested locations
22. **Manage Users** — View all users and activate/deactivate user accounts

### Shared Use Case (MIDDLE — connects to multiple actors)

23. **Search Items** — Search across all approved items by keyword, type, category, and date range (used by both sides, included by View Lost Items and View Found Items)

### Internal/Included Use Case

24. **Email Notification** — System sends automated emails for: report approval/rejection, claim updates, password reset, item matching alerts, and contact form messages (drawn at the bottom center, connected only via <<include>> arrows)

---

## Relationships to Draw

### <<include>> relationships (dashed arrow, from base to included use case)
- Report Lost Item **——<<include>>——▷** Email Notification
- Report Found Item **——<<include>>——▷** Email Notification
- View Lost Items **——<<include>>——▷** Search Items
- View Found Items **——<<include>>——▷** Search Items
- Verify Lost Item Report **——<<include>>——▷** Email Notification
- Verify Found Item Report **——<<include>>——▷** Email Notification
- Approve Claim Request **——<<include>>——▷** Email Notification
- Reject Claim Request **——<<include>>——▷** Email Notification

### <<extend>> relationships (dashed arrow, from extending to base use case)
- Reject Other Pending Claims **——<<extend>>——▷** Approve Claim Request (when a claim is approved, other pending claims for the same item are automatically rejected)

---

## Item Status Workflow (for context, do NOT draw this — just for understanding)
```
Report Submitted → [pending] → Admin Approves → [approved] → Claim Approved → [claimed]
                             → Admin Rejects  → [rejected]
```

## Claim Status Workflow (for context, do NOT draw this)
```
Claim Submitted → [pending] → Admin Reviews → [under_review] → Approved → [approved]
                                              → Rejected → [rejected]
               → User Withdraws → [withdrawn]
```

---

## Diagram Layout Instructions
- Draw a **system boundary rectangle** labeled **"Campus Lost & Found Management System"**
- Place **Student** stick figure on the **upper LEFT** outside the boundary
- Place **Faculty/Staff** stick figure on the **lower LEFT** outside the boundary
- Place **Admin** stick figure on the **RIGHT** outside the boundary
- Both **Student** and **Faculty/Staff** draw association lines to the SAME set of use cases (1–11) on the left side
- **Admin** draws association lines to use cases (12–22) on the right side
- Place **Search Items** in the middle (connected via <<include>> from View Lost Items and View Found Items)
- Place **Email Notification** at the bottom center (connected only via <<include>> dashed arrows)
- Use **<<include>>** labels on dashed arrows pointing toward the included use case
- Use **<<extend>>** label on the dashed arrow from "Reject Other Pending Claims" pointing toward "Approve Claim Request"
- Keep the diagram clean, readable, and properly spaced — standard UML Use Case Diagram notation
