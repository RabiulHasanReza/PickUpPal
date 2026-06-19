## API Routes

### Authentication
- POST /api/auth/signup/rider
- POST /api/auth/signup/driver
- POST /api/auth/login/rider
- POST /api/auth/login/driver


### Rider
- GET  /api/rider/dashboard?rider_id=101
- GET  /api/rider/history?rider_id=101
- POST /api/rider/promo
- POST /api/rider/help


### Driver
- GET  /api/driver/dashboard?driver_id=101
- GET  /api/driver/earnings?driver_id=101
- GET  /api/driver/history?driver_id=101
- PUT  /api/driver/settings
- GET /api/driver/settings?driver_id=101

### Admin
- POST /api/auth/login/admin
- GET  /api/admin/riders
- GET  /api/admin/drivers
- GET  /api/admin/rides
- GET /api/admin/messages