class Hotel {
  constructor(obj) {
    this.hotelName = obj.hotelName;
    this.city = obj.city;
    this.address = obj.address;
    this.arrivalDate = obj.arrivalDate;
    this.departureDate = obj.departureDate;
  }
  static makeActivity(rawHotel) {
    return Object.assign(new Activity(), rawHotel);
  }
}

module.exports = Hotel;
