class CarRental {
  constructor(obj) {
    this.company = obj.rentalCompany;
    this.city = obj.city;
    this.address = obj.address;
    this.pickupTime = obj.pickupTime;
    this.returnTime = obj.returnTime;
    this.startDate = obj.startDate;
    this.returnDate = obj.returnDate;
  }
  static makeActivity(rawCarRental) {
    return Object.assign(new CarRental(), rawCarRental);
  }
}

module.exports = CarRental;
