class Activity {
  constructor(obj) {
    this.activityName = obj.activityName;
    this.organization = obj.organization;
    this.city = obj.city;
    this.address = obj.address;
    this.startTime = obj.startTime;
    this.endTime = obj.endTime;
    this.activityDate = obj.date;
  }
  static makeActivity(rawActivity) {
    return Object.assign(new Activity(), rawActivity);
  }
}

module.exports = Activity;
