const awsIot = require("aws-iot-device-sdk");
const uuidv1 = require("uuid/v1");

module.exports = class IOTService {
  constructor() {
    this.state = {};
  }

  getDevice() {
    return new Promise(resolve => {
      const device = awsIot.device({
        clientId: "tedy-smart-skill-" + uuidv1(),
        host: "a1idkifp80vw18-ats.iot.eu-west-1.amazonaws.com",
        region: "eu-west-1",
        protocol: "wss"
        // debug: true
      });
      device.on("connect", () => {
        console.log("DEBUG: connected");
        resolve(device);
      });
    });
  }

  async init(thingName) {
    const that = this;
    this.thingName = thingName;
    if (this.device) {
      this.device.end();
      this.state = {};
    }
    this.device = await this.getDevice();
    this.device.subscribe(
      "$aws/things/" + this.thingName + "/shadow/update/delta"
    );
    this.device.subscribe(
      "$aws/things/" + this.thingName + "/shadow/get/accepted"
    );
    this.device.on("message", function(topic, payload) {
      console.log("message", topic, payload.toString());
      if (topic.indexOf("delta") > -1) {
        const delta = JSON.parse(payload.toString());
        that.state = {
          ...that.state,
          ...delta.state
        };

        const newState = {
          state: {
            reported: that.state
          }
        };

        that.device.publish(
          "$aws/things/" + that.thingName + "/shadow/update",
          JSON.stringify(newState)
        );
      } else if (topic.indexOf("accepted") > -1) {
        const state = JSON.parse(payload.toString());
        that.state = state.state.reported;
      }
    });
    this.device.on("connected", () => {
      console.log("connected");
    });
    this.device.publish("$aws/things/" + this.thingName + "/shadow/get");
  }
};
