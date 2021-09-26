/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  // Test
  Route.get("/", async () => {
    return { msg: "Konek Aplikasi Bermain bersama" };
  });
  Route.get("/test", "TestsController.hello");

  // Auth
  Route.post("/register", "UsersController.register").as("user.register");
  Route.get("/userLogin", "UsersController.userLogin")
    .as("user.userLogin")
    .middleware("auth");
  Route.post("/otp_confirmation", "UsersController.otp_confirmation").as(
    "user.otp_confirmation"
  );

  // Venue
  Route.resource("venue", "VenuesController")
    .apiOnly()
    .middleware({ "*": ["auth", "verify", "isOwner"] });

  // Field
  Route.resource("venues.field", "FieldsController")
    .apiOnly()
    .middleware({ store: ["auth", "verify", "isOwner"] })
    .middleware({ update: ["auth", "verify", "isOwner"] })
    .middleware({ destroy: ["auth", "verify", "isOwner"] })
    .middleware({ index: ["auth", "verify"] })
    .middleware({ show: ["auth", "verify"] });

  // Booking
  Route.post("/venue/:venue_id/bookings", "BookingsController.create")
    .middleware(["auth", "verify", "isUser"])
    .as("booking.create");

  Route.resource("bookings", "BookingsController")
    .only(["index", "show"])
    .middleware({ "*": ["auth", "verify"] });

  Route.put("/bookings/:id/join", "BookingsController.join")
    .middleware(["auth", "verify", "isUser"])
    .as("booking.join");

  Route.put("/bookings/:id/unjoin", "BookingsController.unjoin")
    .middleware(["auth", "verify", "isUser"])
    .as("booking.unjoin");

  Route.get("/schedules", "BookingsController.schedules")
    .middleware(["auth", "verify", "isUser"])
    .as("booking.schedules");

  Route.post("/login", "UsersController.login").as("user.login");
}).prefix("/api/v1");

Route.get("/", async () => {
  return { msg: "Copy kan link berikut " };
});
