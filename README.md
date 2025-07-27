# Backend API Endpoints:

add longitute and latitude while sending ride request for both picup and destination

remove the arrival messege add a start trip status 


# For accessing Database : 

### Copy the file that I have sent via Wtsap to the .env file
### Create a new server & then register with info in .env file


# In WebSocket : 

## Driver ::
### Driver Register/ Go Online - 
{
  "role" : "driver",
  "action" : "register",
  "driver_id" : _ _ 
}

### Go Offline - 
{
    "role" : "driver",
  "action" : "Go Offline",
  "driver_id" : _ _ 
}

### Accepted-    // After 20 sec request will be Expired
{
    "role" : "driver",
    "action" : "accepted"
}

### Start Trip- // after arriving at the pickup spot
{
    "role" : "driver",
    "action" : "Start Trip",
    "ride_id" : ___
}

### End Trip- // after reacing the destination
{
    "role" : "driver",
    "action" : "End Trip",
    "ride_id" : ___
}

### Rating Rider-
{
    "role" : "driver",
    "action" : "rider_rating",
    "ride_id" : 131,
    "rating" : 4,
    "comment" :  "gooood"
}



## Rider ::
### Rider register/ After giving origin & destination-
{
    "role" : "rider",
    "rider_id" : _ _,
    "action" : "ride_request",

    "origin" : "polashi",
    "origin_latitude" : 232.34,
    "origin_longitude" : 234.343,
    "destination" : "Mirpur",
    "destination_latitude" : 342.32,
    "destination_longitude" : 32.232,

    "distance" : 50
}

### Vehicle Choose- 
{
    "role" : "rider",
    "action" : "select_vehicle",
    "origin" : "polashi",
    "origin_latitude" : 232.34,
    "origin_longitude" : 234.343,
    "destination" : "Mirpur",
    "destination_latitude" : 342.32,
    "destination_longitude" : 32.232,
    "vehicle" : "bike",
    "fare" : 300
}

### Rating Driver-
{
    "role" : "rider",
    "action" : "driver_rating",
    "ride_id" : 131,
    "rating" : 4.5,
    "comment" :  "gooood"
}



