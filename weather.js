"use strict";

let SensorTag = require('sensortag');		// sensortag library
let Async = require('async');

let http = require('http');

const METERS_ABOVE_SEA = process.env.METERS_ABOVE_SEA || 0;
const TEMPERATURE_PREFIX = process.env.TEMPERATURE_PREFIX || "http://localhost/?temperature=";
const PRESSURE_PREFIX = process.env.PRESSURE_PREFIX || "http://localhost/?pressure=";
const LIGHT_PREFIX = process.env.LIGHT_PREFIX || "http://localhost/?light=";

const SEND_TEMPERATURE = process.env.SEND_TEMPERATURE === "true";
const SEND_PRESSURE = process.env.SEND_PRESSURE === "true";
const SEND_LIGHT = process.env.SEND_LIGHT == "true";

const READ_TIMEOUT = 5*60*1000; // 5 minutes

function sendTemperature(temperature, humidity) {
    let host = TEMPERATURE_PREFIX + temperature.toString().substr(0, 5) + "&humV=" + humidity.toString().substr(0, 5);
    return http.get(host, (res) => {});
}

function adjustPressure(pressure, height_m) {
    const PA_PER_METER = 12;
    return pressure + (height_m * PA_PER_METER)/100;
}

function sendPressure(pressure) {
    pressure = adjustPressure(pressure, METERS_ABOVE_SEA);
    let host = PRESSURE_PREFIX + pressure.toString();
    return http.get(host, function(response) { });
}

function sendLight(lux) {
    let host = LIGHT_PREFIX + lux.toString();
    return http.get(host, function(response) { });
}

SensorTag.discoverAll(function (sensorTag) {
    console.log("Connecting to %s...", sensorTag.id);
    
    sensorTag.connectAndSetUp(function (error) { 
        console.log("Connected to %s...", sensorTag.id);
        
        Async.series([
            // function (callback)
            // {
            //     console.log("Starting IR temperatures sensor for %s...", sensorTag.id);
            //     sensorTag.enableIrTemperature(callback);
            // },
            
            function (callback)
            {
              if (SEND_TEMPERATURE) {
                console.log("Starting humidity sensor for %s...", sensorTag.id);
                sensorTag.enableHumidity(callback);
              } else { callback(); }
            },
            
            function (callback)
            {
              if (SEND_PRESSURE) {
                console.log("Starting pressure sensor for %s...", sensorTag.id);
                sensorTag.enableBarometricPressure(callback);
              } else { callback(); }
            },
            
            function (callback)
            {
              if (SEND_LIGHT) {
                console.log("Starting light intensity sensor for %s...", sensorTag.id);
                sensorTag.enableLuxometer(callback);
              } else { callback(); }
            }
        ], function () {
            setInterval(function () {
                let readings = { sensorId: sensorTag.id };
                Async.series([
                //     function (callback)
                //     {
                //         sensorTag.readIrTemperature(function (error, objectTemperature, ambientTemperature) 
                //         {
                //             readings.objectTemperature = objectTemperature;
                //             readings.temperatureFromIr = ambientTemperature;
                //             
                //             callback();
                //         });
                //     },
                    function (callback)
                    {
                      if (SEND_TEMPERATURE) {
                        sensorTag.readHumidity(function (error, temperature, humidity)
                        {
                            readings.humidity = humidity;
                            readings.temperatureFromHumidity = temperature;
                            
                            callback();
                        });
                     } else { callback(); }
                    },
                    function (callback)
                    {
                      if (SEND_PRESSURE) {
                        sensorTag.readBarometricPressure(function (error, pressure)
                        {
                            readings.pressure = pressure;
                            
                            callback();
                        });
                     } else { callback(); }
                    },
                    function (callback)
                    {
                      if (SEND_LIGHT) {
                        sensorTag.readLuxometer(function (error, lux){
                            readings.lux = lux;
                            
                            callback();
                        });
                     } else { callback(); }
                    }
                ], function()
                {
                    readings.currentTime = new Date();
                    if (SEND_TEMPERATURE) sendTemperature(readings.temperatureFromHumidity, readings.humidity);
                    if (SEND_PRESSURE) sendPressure(readings.pressure);
                    if (SEND_LIGHT) sendLight(readings.lux);
                });
            }, READ_TIMEOUT);
        });
    });

    sensorTag.on('disconnect', function() {
        console.log("Disconnected from %s!", sensorTag.id);
        process.exit(1);
    });
});
