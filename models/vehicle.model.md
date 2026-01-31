# Vehicle Model Documentation

## Table Name
`vehicles`

## Description
Stores vehicle information owned by users with 'owner' role.
Vehicless can be assigned to drivers and booked for trips.

## Columns

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| name | VARCHAR(255) | NOT NULL | Vehicle name/model |
| registration_number | VARCHAR(255) | UNIQUE, NOT NULL | Vehicle registration plate (must be unique) |
| allowed_passengers | INTEGER | NOT NULL | Maximum number of passengers allowed |
| is_available | BOOLEAN | DEFAULT true | Availability status for bookings |
| driver_id | INTEGER | FOREIGN KEY, NULLABLE | Reference to driver (users table) |
| rate_per_km | DECIMAL(10,2) | NOT NULL | Charge per kilometer |
| owner_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to owner (users table) |
| created_at | TIMESTAMP | DEFAULT NOW() | Vehicle creation timestamp |

## Constraints
- **Registration Number Uniqueness**: Each registration number must be unique
- **Foreign Key - driver_id**: References users(id) where role = 'driver'
- **Foreign Key - owner_id**: References users(id) where role = 'owner'

## Relationships
- **Many-to-One with Users (owner)**: Many vehicles can belong to one owner
- **One-to-One with Users (driver)**: One vehicle can be assigned to one driver
- **One-to-Many with Trips**: One vehicle can have multiple trips

## Business Rules
- Only owners can create vehicles
- Owner can assign a driver to vehicle later
- vehicle.isAvailable becomes false when trip is created
- vehicle.isAvailable becomes true when trip ends or is deleted
- Registration number must be unique
