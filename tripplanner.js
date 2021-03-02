const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const store = require("connect-loki");
const LokiStore = store(session);
const { body, validationResult } = require("express-validator");

const Trip = require("./lib/trip");
const Hotel = require("./lib/Hotel");
const Flight = require("./lib/Flight");
const CarRental = require("./lib/CarRental");
const Activity = require("./lib/Activity");

const app = express();
const host = "localhost";
const port = 3001;

// let currentId = 0;

// let nextId = () => {
//   currentId += 1;
//   return currentId;
// };

// const clone = (object) => {
//   return JSON.parse(JSON.stringify(object));
// };

// get specific trip
const findTrip = (tripId, tripSessionData) => {
  return tripSessionData.find((trip) => trip.id === tripId);
};

// add travel plan to trip
const addTravelPlans = (travelType, requestBody, myTrip) => {
  switch (travelType) {
    case "hotel":
      let newHotel = new Hotel({ ...requestBody });
      console.log(newHotel);
      myTrip.addHotel(newHotel);
      console.log("added hotels");
      break;
    case "carRental":
      let newCarRental = new CarRental({ ...requestBody });
      console.log(myTrip);
      console.log(newCarRental);
      myTrip.addCarRental(newCarRental);
      console.log("added car");
      break;
    case "flight":
      let newFlight = new Flight({ ...requestBody });
      myTrip.addFlight(newFlight);
      console.log("added flight");
      break;
    case "activity":
      let newActivity = new Activity({ ...requestBody });
      myTrip.addActivity(newActivity);
      console.log("added activity");
      break;
    default:
      break;
  }
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Create new browser session & cookie to store data
app.use(
  session({
    cookie: {
      httpOnly: true,
      maxAge: 31 * 24 * 60 * 60 * 1000,
      path: "/",
      secure: false,
    },
    name: "trip-planner-session-id",
    resave: false,
    saveUninitialized: true,
    secret: "This is not very secure",
    store: new LokiStore(),
  })
);

app.use(flash());

// app.use((req, res, next) => {
//   if (!("tripData" in req.session)) {
//     req.session.tripData = [];
//   }
//   next();
// });

app.use((req, res, next) => {
  let newTripData = [];

  console.log(req.session);
  if ("tripData" in req.session) {
    console.log("current trip Data=" + req.session);
    req.session.tripData.forEach((trip) => {
      newTripData.push(Trip.makeTrip(trip));
    });
  }

  req.session.tripData = newTripData;
  next();
});

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.get("/", (req, res) => {
  res.redirect("trips");
});

app.get("/trips", (req, res) => {
  let list = req.session.tripData;
  res.render("trips", {
    tripList: list,
  });
});

// display individual trip page
app.get("/trips/:tripId", (req, res) => {
  let tripId = +req.params.tripId;
  console.log(tripId);
  let myTrip = findTrip(tripId, req.session.tripData);
  console.log(myTrip);
  res.render("trip", {
    trip: myTrip,
    hotelList: myTrip.hotels,
    carRentalList: myTrip.carRentals,
    flightList: myTrip.flights,
    activityList: myTrip.activities,
  });
});

// display add new trip page
app.get("/newtrip", (req, res) => {
  res.render("new-trip");
});

const validateName = (name, whichName) => {
  // const valid = (name) => input.split(' ').every(function (word) { return isAlpha(word); });
  return body(name)
    .trim()
    .isLength({ min: 1 })
    .withMessage(`${whichName} name is required.`)
    .bail()
    .isLength({ max: 25 })
    .withMessage(
      `${whichName} name is too long. Maximum length is 25 characters.`
    )
    .isAlpha("en-US", { ignore: " " })
    .withMessage(
      `${whichName} name contains invalid characters. The name must be alphabetic.`
    );
};

// add a new trip from form submission
app.post(
  "/newtrip/add",
  [
    validateName("tripTitle", "Trip Title"),
    body("startDate").isDate().withMessage("You need a valid start date!"),
    body("endDate").isDate().withMessage("You need a valid end date!"),
  ],
  (req, res, next) => {
    let tripId = +req.params.tripId;
    let myTrip = findTrip(tripId, req.session.tripData);
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash("error", error.msg)),
        // can create flash message to display here
        res.render("new-trip", {
          flash: req.flash(),
          // errorMessages: errors.array().map((error) => error.msg),
          tripTitle: req.body.tripTitle,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          trip: myTrip,
        });
    } else {
      next();
    }
  },
  (req, res) => {
    let theTrip = new Trip({ ...req.body });
    req.session.tripData.push(theTrip);
    req.flash("success", "New trip added to the list!");
    res.redirect("/trips");
  }
);

// add new hotel from form data
app.post(
  "/trip/:tripId/add/hotel",
  [
    validateName("hotelName", "Hotel"),
    body("address")
      .trim()
      .isLength({ min: 1 })
      .withMessage(
        "Please enter an address containing only letters and numbers"
      ),
    body("city")
      .trim()
      .isLength({ min: 1 })
      .withMessage(
        "Please enter an address containing only letters and numbers"
      ),
  ],
  (req, res, next) => {
    let tripId = +req.params.tripId;
    let myTrip = findTrip(tripId, req.session.tripData);
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash("error", error.msg)),
        // can create flash message to display here
        res.render(`trip`, {
          flash: req.flash(),
          // errorMessages: errors.array().map((error) => error.msg),
          hotelName: req.body.hotelName,
          city: req.body.city,
          address: req.body.address,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          hotelList: myTrip.hotels,
          carRentalList: myTrip.carRentals,
          flightList: myTrip.flights,
          activityList: myTrip.activities,
          trip: myTrip,
        });
    } else {
      next();
    }
  },
  (req, res) => {
    let tripId = +req.params.tripId;
    let travelType = "hotel";
    let myTrip = findTrip(tripId, req.session.tripData);
    addTravelPlans(travelType, req.body, myTrip);
    res.render("trip", {
      trip: myTrip,
      hotelList: myTrip.hotels,
    });
  }
);

// add new car rental from form data
app.post(
  "/trip/:tripId/add/carRental",
  [
    validateName("rentalCompany", "Car Rental"),
    body("address")
      .trim()
      .isLength({ min: 1 })
      .withMessage(
        "Please enter an address containing only letters and numbers"
      ),
    body("city")
      .trim()
      .isLength({ min: 1 })
      .withMessage(
        "Please enter an address containing only letters and numbers"
      ),
  ],
  (req, res, next) => {
    let tripId = +req.params.tripId;
    let myTrip = findTrip(tripId, req.session.tripData);
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash("error", error.msg)),
        // can create flash message to display here
        res.render(`trip`, {
          flash: req.flash(),
          // errorMessages: errors.array().map((error) => error.msg),
          rentalCompany: req.body.rentalCompany,
          city: req.body.city,
          address: req.body.address,
          startDate: req.body.startDate,
          returnDate: req.body.returnDate,
          pickupTime: req.body.pickupTime,
          returnTime: req.body.returnTime,
          hotelList: myTrip.hotels,
          carRentalList: myTrip.carRentals,
          flightList: myTrip.flights,
          activityList: myTrip.activities,
          trip: myTrip,
        });
    } else {
      next();
    }
  },
  (req, res) => {
    let tripId = +req.params.tripId;
    let travelType = "carRental";
    let myTrip = findTrip(tripId, req.session.tripData);
    addTravelPlans(travelType, req.body, myTrip);
    res.render("trip", {
      trip: myTrip,
      hotelList: myTrip.hotels,
      carRentalList: myTrip.carRentals,
    });
  }
);

app.post(
  "/trip/:tripId/add/flight",
  [validateName("airline", "Airline")],
  (req, res, next) => {
    let tripId = +req.params.tripId;
    let myTrip = findTrip(tripId, req.session.tripData);
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash("error", error.msg)),
        // can create flash message to display here
        res.render(`trip`, {
          flash: req.flash(),
          // errorMessages: errors.array().map((error) => error.msg),
          rentalCompany: req.body.rentalCompany,
          city: req.body.city,
          address: req.body.address,
          startDate: req.body.startDate,
          returnDate: req.body.returnDate,
          pickupTime: req.body.pickupTime,
          returnTime: req.body.returnTime,
          hotelList: myTrip.hotels,
          carRentalList: myTrip.carRentals,
          flightList: myTrip.flights,
          activityList: myTrip.activities,
          trip: myTrip,
        });
    } else {
      next();
    }
  },
  (req, res) => {
    let tripId = +req.params.tripId;
    let travelType = "flight";
    let myTrip = findTrip(tripId, req.session.tripData);
    addTravelPlans(travelType, req.body, myTrip);
    res.render("trip", {
      trip: myTrip,
      hotelList: myTrip.hotels,
      carRentalList: myTrip.carRentals,
      flightList: myTrip.flights,
      activityList: myTrip.activities,
    });
  }
);

app.post(
  "/trip/:tripId/add/activity",
  [validateName("organization", "Organization")],
  (req, res, next) => {
    let tripId = +req.params.tripId;
    let myTrip = findTrip(tripId, req.session.tripData);
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((error) => req.flash("error", error.msg)),
        // can create flash message to display here
        res.render(`trip`, {
          flash: req.flash(),
          // errorMessages: errors.array().map((error) => error.msg),
          rentalCompany: req.body.rentalCompany,
          city: req.body.city,
          address: req.body.address,
          startDate: req.body.startDate,
          returnDate: req.body.returnDate,
          pickupTime: req.body.pickupTime,
          returnTime: req.body.returnTime,
          hotelList: myTrip.hotels,
          carRentalList: myTrip.carRentals,
          flightList: myTrip.flights,
          activityList: myTrip.activities,
          trip: myTrip,
        });
    } else {
      next();
    }
  },
  (req, res) => {
    let tripId = +req.params.tripId;
    let travelType = "activity";
    let myTrip = findTrip(tripId, req.session.tripData);
    addTravelPlans(travelType, req.body, myTrip);
    res.render("trip", {
      trip: myTrip,
      hotelList: myTrip.hotels,
      carRentalList: myTrip.carRentals,
      flightList: myTrip.flights,
      activityList: myTrip.activities,
    });
  }
);

app.listen(port, host, () => {
  console.log(`Trip planner is listening on port ${port} of ${host}`);
});
