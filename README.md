IoT Dashboard Project
This is my website for monitoring sensor data. It shows live readings for things like temperature, humidity, and voltage from different devices. I built this using React and React Router.

What this website does
Dashboard: Shows a quick look at the total readings and active devices.

Sensor Cards: Small boxes that show the latest data from each sensor.

Alerts: A page that lists when a sensor goes above or below its allowed limit.

Raw Data: A big table that shows every single reading we have saved.

How to run it on your computer
Get the code: First, you need to have this folder on your computer.

Install stuff: Open your terminal in this folder and type:

Bash
npm install
(This will download all the React tools needed to run the app.)

Start the app: Type this command next:

Bash
npm start
Open the browser: Go to http://localhost:3000 to see the dashboard.

My Project Files
App.js: This is the main file that handles the navigation menu.

App.css: All the styles and colors are kept here so the site looks good.

pages/: This folder has the different pages like Dashboard and Alerts.

api/api.js: This is where the code talks to the backend server to get data.

Important Note
Make sure the Backend Server is running, otherwise the website will show an error message saying it cannot load the data!