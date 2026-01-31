# Trip Model Documentation

## Table Name
`trips`

## Description
Stores trip bookings created by customers. Tracks trip details, costs, and completion status.

## Columns

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| customer_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to customer (users table) |
| vehicle_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to vehicle (vehicles table) |
| start_date | TIMESTAMP | NOT NULL | Trip start date and time |
| end_date | TIMESTAMP | NOT NULL | Trip end date and time |
| location | VARCHAR(255) | NOT NULL | Trip location/destination |
| distance_km | DECIMAL(10,2) | NOT NULL | Distance traveled in kilometers |
| passengers | INTEGER | NOT NULL | Number of passengers |
| trip_cost | DECIMAL(10,2) | DEFAULT 0 | Total trip cost (calculated on trip end) |
| is_completed | BOOLEAN | DEFAULT false | Trip completion status |
| created_at | TIMESTAMP | DEFAULT NOW() | Trip creation timestamp |

## Constraints
- **Foreign Key - customer_id**: References users(id) where role = 'customer'
- **Foreign Key - vehicle_id**: References vehicles(id)
- **Passenger Limit**: passengers must not exceed vehicle's allowed_passengers

## Relationships
- **Many-to-One with Users (customer)**: Many trips can be created by one customer
- **Many-to-One with Vehicles**: Many trips can use one vehicle

## Business Rules
- Only customers can create trips
- Selected vehicle must be available (is_available = true)
- Number of passengers must not exceed vehicle's allowed_passengers
- When trip is created: vehicle.isAvailable → false
- When trip ends: 
  - trip.isCompleted → true
  - trip.tripCost = distance_km × vehicle.rate_per_km
  - vehicle.isAvailable → true
- When trip is deleted: vehicle.isAvailable → true

## Trip Cost Calculation
tripCost = distance_km * rate_per_km
Example: 50 km × ₹100/km = ₹5000 ( petrol is very expensive switch to ev/)
