### Backend API Endpoints:

For these pages to work fully, you'll need the following backend API endpoints:

1. For Rider:
   - `GET /rides?rider_id={id}` - Get ride history for a rider
   - `GET /payment-methods?user_id={id}` - Get saved payment methods
   - `POST /payment-methods` - Add new payment method
   - `DELETE /payment-methods/{id}` - Delete payment method
   - `PUT /payment-methods/{id}/default` - Set default payment method
   - `GET /user/settings?user_id={id}` - Get user settings
   - `PUT /user/{id}/update` - Update user profile

2. For Driver:
   - `GET /driver/rides?driver_id={id}` - Get ride history for a driver
   - `GET /driver/earnings?driver_id={id}&range={range}` - Get earnings data
   - `GET /driver/vehicle?driver_id={id}` - Get vehicle info
   - `PUT /driver/vehicle/{driver_id}/update` - Update vehicle info
   - `GET /driver/settings?driver_id={id}` - Get driver settings
   - `PUT /driver/{id}/update` - Update driver profile
