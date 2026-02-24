import axios from 'axios';

// The server address
let myUrl = "http://localhost:8000";
if (process.env.REACT_APP_API_URL) {
  myUrl = process.env.REACT_APP_API_URL;
}

// Get all the sensor data
export async function getSensorReadings(options) {
  var p = options.page || 1;
  var s = options.pageSize || 20;
  var t = options.topic || null;
  var st = options.startTime || null;
  var et = options.endTime || null;

  var fullUrl = myUrl + "/api/sensor-data/?page=" + p + "&page_size=" + s;
  
  if (t !== null) {
    fullUrl = fullUrl + "&topic=" + t;
  }
  if (st !== null) {
    fullUrl = fullUrl + "&start_time=" + st;
  }
  if (et !== null) {
    fullUrl = fullUrl + "&end_time=" + et;
  }

  const res = await axios.get(fullUrl);
  return res.data;
}

export async function getLatestReadings() {
  const res = await axios.get(myUrl + "/api/sensor-data/latest");
  return res.data;
}

export async function getSensorStats() {
  const res = await axios.get(myUrl + "/api/sensor-data/stats");
  return res.data;
}

export async function getAllTopics() {
  const res = await axios.get(myUrl + "/api/sensor-data/topics");
  return res.data;
}

// Alert functions
export async function getAlerts(options) {
  var p = options.page || 1;
  var s = options.pageSize || 20;
  var sev = options.severity || null;
  var t = options.topic || null;

  var url = myUrl + "/api/alerts/?page=" + p + "&page_size=" + s;

  if (sev !== null) {
    url = url + "&severity=" + sev;
  }
  if (t !== null) {
    url = url + "&topic=" + t;
  }

  const res = await axios.get(url);
  return res.data;
}

export async function getRecentAlerts(num) {
  var limit = num;
  if (!num) {
    limit = 5;
  }
  const res = await axios.get(myUrl + "/api/alerts/recent?limit=" + limit);
  return res.data;
}

export async function getAlertStats() {
  const res = await axios.get(myUrl + "/api/alerts/stats");
  return res.data;
}