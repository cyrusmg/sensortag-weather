Sensortag Weather synchronised with TMEP.CZ
===========================================

## 1. Register yourself at TMEP.CZ and create a new "sensor" project there
## 2. Install this on your RPI:

```
npm install
npm run
```

## 3. Set correct ENV variables

* `METERS_ABOVE_SEA`: Pressure adjustment for your location
* `TEMPERATURE_PREFIX`, `PRESSURE_PREFIX`, `LIGHT_PREFIX`: TMEP.CZ prefix for your sensor. I.e. "http://my-sensor.tmep.cz/temperature="
* `SEND_TEMPERATURE`: if "true" `TEMPERATURE_PREFIX` will be called with the data
* `SEND_PRESSURE`: ditto pressure
* `SEND_LIGHT`: ditto light

Note: Read timeout is set to 5 minutes
