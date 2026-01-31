# User Model Documentation

## Table Name
`users`

## Description
Stores all user information for the fleet management system. Supports three types of users: customers, owners, and drivers.

## Columns

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address  |
| password | VARCHAR(255) | NOT NULL | User's password  |
| role | VARCHAR(50) | NOT NULL, CHECK | User's role (customer, owner, or driver) |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

## Constraints
- **Email Uniqueness**: Each email can only be registered once
- **Role Validation**: Role must be one of: 'customer', 'owner', 'driver'
- **Required Fields**: name, email, password, and role are mandatory

## Relationships
- **One-to-Many with Vehicles** (as owner): One owner can own multiple vehicles
- **One-to-One with Vehicle** (as driver): One driver can be assigned to one vehicle
- **One-to-Many with Trips** (as customer): One customer can create multiple trips

## Business Rules
- All three roles (customer, owner, driver) must be able to sign up
- Email must be unique across all users
- Role must be validated during signup
- Each user can have only ONE role
