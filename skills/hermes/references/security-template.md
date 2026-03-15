# ATT Standard Security Section — Template Content

Use this as a starting base for the System Security Design section.
**Always tailor to the specific RFP** — reference specific clause numbers where they exist,
and adjust the level of detail to match what evaluators are scoring.

---

## Information Protection and Confidentiality

The System is designed to protect the confidentiality of all data stored and transmitted.
All communications between system components are encrypted using SSL/TLS. Access to data
is controlled through role-based permissions; no user may access data beyond their
authorised scope.

---

## Authentication and Access Control

The System implements the following authentication and access control model:

- **LDAP / Active Directory Integration:** All user logins are validated against the
  customer's AD server using open LDAP standards.
- **Session Management:** All login sessions have a configurable timeout period. When a
  session is idle and reaches the timeout threshold, it terminates automatically.
- **Role-Based Access Control (RBAC):** The System is designed with RBAC. Function Roles
  are created with defined sets of functions. Users may be assigned one or more Roles
  (e.g. Super User, System Administrator, Site Manager). This allows the Customer to
  grant or revoke access to functional areas independently.
- **Privileged Users:** Segregation of duties for Privileged Users (system administrators,
  security administrators) is clearly defined and documented.
- **Privilege Revocation:** The Supplier will remove administrative privileges from the
  System once they are no longer required and provide proof of revocation.
- **Audit of Access:** Audit trails of all logon/logout events and required transactions
  are maintained within the System.

---

## Information Integrity

The Supplier will protect data from being altered or deleted without proper authorisation.

- Access granted to any data and/or resources is easily configurable, and changes are
  logged by the System.
- System Administrators can control user/user group access to data at multiple levels:
  modules, screens, functions, and individual data fields.

---

## Application Audit Trail

The System captures audit trails for all transactions performed:

- Authorised System Administrators can select which transactions are recorded.
- Each audit trail entry includes: system identifier, user identifier, action taken
  (Create / Retrieve / Update / Delete), and date/time stamp.
- For Update actions, the System captures both the "before" and "after" values.
- Illegal access attempts (to system, data, and functions) are captured.
- Only authorised users may view audit information; no modification is permitted.
- Audit trails are maintained online for a minimum of one (1) month; thereafter they
  are archived offline.
- The System provides search/query capabilities and audit log reporting functions.

**User Audit Trail (Privileged Users):**
The following events are logged with timestamps for all users including Privileged Users:
- Login (successful and unsuccessful)
- Logout
- Unsuccessful access attempts and access violations
- System start-up and shutdown
- System backup and recovery
- Security profile changes
- System maintenance activities

These audit trails are protected from modification and are available for independent review.

---

## Application Security

- The Supplier will conduct annual checks on System functional capabilities and security
  controls throughout the System lifecycle.
- The design and implementation comply with the current OWASP Top 10 web application
  vulnerabilities list.
- Security controls implemented include: input validation, workflow controls, message
  integrity, and output validation.
- The System will not contain any hidden functionality unknown to the Customer.
- Detailed security control documentation will be provided and approved by the Customer.

---

## Network Communication Security

- The System adheres to the customer's firewall rules and policies.
- All necessary ports required for system operation will be formally requested and
  documented.
- All inter-component communications are encrypted (SSL/TLS).

---

## Database Security

Servers are configured with the following security hardening:
- Hardening of Operating System
- Hardening of Server Ports
- Hardening of Database Server Software (PostgreSQL / MSSQL)
- User profile hardening and access control to Database Server and database

---

## Server Security

Servers are configured with the following security hardening:
- Hardening of Operating System Software
- Hardening of Server Ports
- User profile hardening and access control
