const Trip = require("./trip");

class TripList {
  constructor() {
    this.triplists = [];
  }
  static makeTripList(rawTripList) {
    return Object.assign(new Activity(), rawTripList);
  }
  addTrip(trip) {}
  deleteTrip(trip) {}
  editTripName(trip) {}
}

modules.export = TripList;
