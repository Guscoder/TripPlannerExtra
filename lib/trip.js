const nextId = require("./next-id");
const Flight = require("./Flight");
const CarRental = require("./CarRental");
const Hotel = require("./Hotel");
const Activity = require("./Activity");

class Trip {
  constructor({ tripTitle, startDate, endDate }) {
    this.id = nextId();
    this.tripTitle = tripTitle;
    this.startDate = startDate;
    this.endDate = endDate;
    this.carRentals = [];
    this.flights = [];
    this.hotels = [];
    this.activities = [];
    this.currentItinerary = [];
  }
  static makeTrip(rawTrip) {
    console.log("making trip");
    let trip = Object.assign(new Trip(rawTrip), {
      id: rawTrip.id,
      currentItinerary: rawTrip.currentItinerary,
    });
    console.log("here baby" + { ...rawTrip });
    rawTrip.carRentals.forEach((car) => trip.addCarRental(new CarRental(car)));
    rawTrip.hotels.forEach((hotel) => trip.addHotel(new Hotel(hotel)));
    rawTrip.flights.forEach((flight) => trip.addFlight(new Flight(flight)));
    rawTrip.activities.forEach((activity) =>
      trip.addActivity(new Activity(activity))
    );

    return trip;
  }
  addHotel(hotel) {
    console.log(hotel);
    console.log("adding hotel");
    if (!(hotel instanceof Hotel)) {
      throw new TypeError("can only add Hotel objects");
    } else {
      this.hotels.push(hotel);
    }
  }
  addCarRental(car) {
    console.log(car);
    if (!(car instanceof CarRental)) {
      throw new TypeError("can only add Car objects");
    } else {
      this.carRentals.push(car);
    }
  }
  addFlight(flight) {
    if (!(flight instanceof Flight)) {
      throw new TypeError("can only add Flight objects");
    } else {
      this.flights.push(flight);
    }
  }
  addActivity(activity) {
    if (!(activity instanceof Activity)) {
      throw new TypeError("can only add Activity objects");
    } else {
      this.activities.push(activity);
    }
  }
  deleteHotel() {}
  deleteCar() {}
  deleteFlight() {}
  deleteActivity() {}
  editItem(item) {}
}

module.exports = Trip;
