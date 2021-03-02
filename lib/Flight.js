class Flight {
  constructor(obj) {
    this.airline = obj.airline;
    this.flightNumber = obj.flightNumber;
    this.departureAirport = obj.departureAirport;
    this.arrivalAirport = obj.arrivalAirport;
    this.departureTime = obj.departureTime;
    this.arrivalTime = obj.arrivalTime;
    this.arrivalDate = obj.arrivalDate;
    this.departureDate = obj.departureDate;
  }
  static makeFlight(rawFlight) {
    return Object.assign(new Activity(), rawFlight);
  }
}

module.exports = Flight;
