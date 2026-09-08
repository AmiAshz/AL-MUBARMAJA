# AL Mubarmaja Backend API

Welcome to the AL Mubarmaja Backend system, a robust Express.js & Prisma powered engine managing the entire vehicle repair lifecycle. 

## The AL Mubarmaja Workflow

```text
                  AL MUBARMAJA
                       │
                VEHICLE ARRIVES
                       │
                       ▼
                 CUSTOMER COMPLAINT
                       │
                       ▼
                    INSPECTION
                       │
                       ▼
                    DIAGNOSIS
                       │
                       ▼
               REPAIR ESTIMATE
                       │
                 CUSTOMER APPROVAL
                       │
                       ▼
                     REPAIR
                   ↙       ↘
          PARTS AVAILABLE   PARTS NEEDED
                 │              │
                 └──────┬───────┘
                        ▼
                  QUALITY CHECK
                        │
                        ▼
                 FINAL REPAIR COST
                        │
                        ▼
                  READY FOR PICKUP
                        │
                        ▼
                    COMPLETED
```

## Features

- **Role-Based Access Control (RBAC):** 5-tier permission system for Admin, Manager, Service Advisor, Technician, and Receptionist.
- **Strict State Management:** State-machine enforced transitions ensure vehicles cannot skip crucial phases (e.g., Final Billing cannot occur until Repair is complete).
- **Immutable Audit Trails:** Every change to vehicle status, estimate approval, or financial ledger generates a permanent `ProgressLog`.
- **Server-Side Financials:** All estimates, taxes, and final repair balances are calculated purely on the backend to guarantee data integrity.
- **Socket.IO Real-Time Engine:** Emits instant workshop updates (`vehicle:updated`, `progress:added`) to ensure staff dashboards are always synchronized without refreshing.
- **Blazing Fast Test Suite:** 100% test coverage for all core services using native Jest mocks that simulate the entire relational database layer in < 1 second.
